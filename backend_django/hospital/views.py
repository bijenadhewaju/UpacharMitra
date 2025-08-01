from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PatientAppointmentSerializer
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Sum, Count
from .serializers import DoctorCreateSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password
from .serializers import DaySerializer, TimeSlotSerializer # You'll create DaySerializer next
from datetime import timedelta
import hashlib
import hmac
import base64
import json
import random
from .models import Specialty 
from .serializers import SpecialtySerializer 
from datetime import datetime
from .models import Doctor, Hospital, Appointment, HospitalAdmin, UserProfile, DoctorHospital, Day, TimeSlot
from datetime import datetime, date, timedelta
from django.db import models
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
 
from .serializers import (
    DoctorSerializer,
    HospitalSerializer,
    AppointmentSerializer,
    UserProfileSerializer,
    TimeSlotSerializer, 
    PatientAppointmentSerializer,
    AdminAppointmentSerializer
)

#Load the model only once (avoid reloading on every request)
model_name = "bijenadhewaju/distilbert_medical_speciality"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval() 

@api_view(['GET'])
def test_booking(request):
    return Response({"message": "Booking endpoint reachable"})

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def home(request):
    return HttpResponse("Hospital backend is running")

# ------------------ Hospital & Doctor Views ------------------

class HospitalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Doctor.objects.all()
        hospital_id = self.request.query_params.get('hospital_id')
        specialty_name = self.request.query_params.get('specialty') # Get name from ?specialty=...

        if hospital_id:
            queryset = queryset.filter(hospitals__id=hospital_id)
        
        # ❗ KEY FIX: Filter by the 'name' of the related specialty object
        if specialty_name:
            queryset = queryset.filter(specialty__name__iexact=specialty_name)
            
        return queryset

class DoctorListAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        doctors = Doctor.objects.all()
        serializer = DoctorSerializer(doctors, many=True, context={'request': request})
        return Response(serializer.data)

class DoctorDetailAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, doc_id):
        try:
            doctor = Doctor.objects.get(id=doc_id)
            serializer = DoctorSerializer(doctor, context={'request': request})
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

#prediction
class PredictSpecialtyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        symptom = request.data.get("symptom", "")
        if not symptom:
            return Response({"error": "Symptom is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Tokenize input
        inputs = tokenizer(symptom, return_tensors="pt", truncation=True, padding=True, max_length=128)

        # Predict
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = F.softmax(logits, dim=1).squeeze()
            predicted_idx = torch.argmax(probs).item()

        # Use int keys
        label = model.config.id2label.get(predicted_idx, str(predicted_idx))
        reasoning = f"Based on the symptom description, this was most closely associated with '{label}' cases in training."

        return Response({
            "specialty": label,
            "reasoning": reasoning,
            "probabilities": {
                model.config.id2label[i]: round(prob.item(), 3) for i, prob in enumerate(probs)
            }
        })
    
    #suggest doctor 

@api_view(['POST'])
@permission_classes([AllowAny])
def suggest_doctor(request):
    specialty = request.data.get("specialty", "").strip()
    if not specialty:
        return Response({"error": "Specialty not provided"}, status=400)

    try:
        specialty_obj = Specialty.objects.get(name__icontains=specialty)
    except Specialty.DoesNotExist:
        return Response({"error": "Specialty not found"}, status=404)

    doctor_hospitals = DoctorHospital.objects.filter(
        doctor__specialty=specialty_obj
    ).select_related('doctor', 'hospital')

    if doctor_hospitals.exists():
        doctor_list = []
        for dh in doctor_hospitals:
            doctor_list.append({
                "id": dh.doctor.id,
                "doctor_name": dh.doctor.name,
                "hospital_name": dh.hospital.name,
                "fees": dh.opd_charge,  # assuming 'opd_charge' is the field name
            })
        return Response({"doctors": doctor_list})
    else:
        return Response({"error": "No doctors found for this specialty"}, status=404)
    
    
# ------------------ Appointment Booking ------------------

from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from datetime import datetime


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    doctor_id = request.data.get('doctor_id')
    hospital_id = request.data.get('hospital_id')
    day_str = request.data.get('day')
    time_str = request.data.get('time')

    if not all([doctor_id, hospital_id, day_str, time_str]):
        return Response({"error": "doctor_id, hospital_id, day, and time are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        doctor = Doctor.objects.get(id=doctor_id)
        hospital = Hospital.objects.get(id=hospital_id)
    except (Doctor.DoesNotExist, Hospital.DoesNotExist):
        return Response({"error": "Doctor or Hospital not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        appointment_time = datetime.strptime(time_str, "%H:%M").time()
        today = date.today()
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        chosen_day_index = days_of_week.index(day_str)
        days_ahead = chosen_day_index - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        appointment_date = today + timedelta(days=days_ahead)
        appointment_datetime = datetime.combine(appointment_date, appointment_time)
    except (ValueError, IndexError):
        return Response({"error": "Invalid day or time format provided."}, status=status.HTTP_400_BAD_REQUEST)

    if Appointment.objects.filter(doctor=doctor, appointment_datetime=appointment_datetime, status='booked').exists():
        return Response({"error": "This appointment slot is already taken."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_appointment = Appointment.objects.create(
            patient=request.user,
            doctor=doctor,
            hospital=hospital,
            appointment_datetime=appointment_datetime,
            status='pending',
            payment_status=False
        )
        return Response({
            "message": "Appointment created. Proceed to payment.",
            "appointment_id": new_appointment.id
        }, status=status.HTTP_201_CREATED)
    except IntegrityError:
         return Response({"error": "Database error while creating appointment."}, status=status.HTTP_400_BAD_REQUEST)


    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def myappointment(request):
    user = request.user
    appointments = Appointment.objects.filter(patient=user).select_related('doctor').order_by('-appointment_datetime')
    serializer = PatientAppointmentSerializer(appointments, many=True, context={'request': request})
    return Response(serializer.data)

#cancel appointment
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Appointment

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request):
    appointment_id = request.data.get('appointment_id')

    if not appointment_id:
        return Response({'error': 'Appointment ID is required'}, status=400)

    try:
        appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
        appointment.status = 'canceled'
        appointment.save()
        return Response({'success': True, 'message': 'Appointment cancelled'}, status=200)
    except Appointment.DoesNotExist:
        return Response({'success': False, 'error': 'Appointment not found'}, status=404)


# Hospital Admin Appointments 

class HospitalAdminAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            hospital_admin = HospitalAdmin.objects.get(user=request.user)
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "User is not a hospital admin"}, status=status.HTTP_403_FORBIDDEN)

        doctors = Doctor.objects.filter(hospital=hospital_admin.hospital)
        appointments = Appointment.objects.filter(doctor__in=doctors).select_related('doctor', 'patient')

        serialized = [{
            "id": appt.id,
            "patient_name": appt.patient.first_name or appt.patient.username,
            "doctor_name": appt.doctor.name,
            "appointment_datetime": appt.appointment_datetime.strftime("%d %b %Y, %I:%M %p"),
            "fees": getattr(appt.doctor, 'fees', None),
            "status": appt.status,
            "doctor_photo": appt.doctor.photo.url if appt.doctor.photo else "",
        } for appt in appointments]

        return Response(serialized)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request):
    appointment_id = request.data.get('appointment_id')
    status_value = request.data.get('status')

    if not appointment_id or not status_value:
        return Response({"error": "appointment_id and status are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        hospital_admin = HospitalAdmin.objects.get(user=request.user)
        if appointment.hospital != hospital_admin.hospital:
            return Response({'error': 'Not authorized to update this appointment'}, status=status.HTTP_403_FORBIDDEN)
    except HospitalAdmin.DoesNotExist:
        return Response({'error': 'User is not a hospital admin'}, status=status.HTTP_403_FORBIDDEN)

    appointment.status = status_value
    appointment.save()
    return Response({'message': 'Status updated successfully'})

# ------------------ Auth ------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Step 1: Creates an inactive user and sends an OTP to their email.
    """
    User = get_user_model()
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name')

    if not all([email, password, name]):
        return Response({"success": False, "message": "Name, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"success": False, "message": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # Create an inactive user first
    user = User.objects.create_user(
        username=email, email=email, first_name=name, password=password, is_active=False
    )
    profile, created = UserProfile.objects.get_or_create(user=user)

    # Generate and save OTP
    otp = random.randint(100000, 999999)
    profile.otp = str(otp)
    profile.otp_created_at = timezone.now()
    profile.save()

    # Send OTP email
    send_mail(
        'Your OTP for Upachar Mitra',
        f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
        'anjalshrestha13@gmail.com',
        [email],
        fail_silently=False,
    )

    return Response({
        "success": True,
        "message": f"OTP sent to {email}. Please verify to complete registration."
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_and_activate_user(request):
    """
    Step 2: Verifies the OTP and activates the user account.
    """
    User = get_user_model()
    email = request.data.get('email')
    otp_entered = request.data.get('otp')

    if not email or not otp_entered:
        return Response({"success": False, "message": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        profile = user.profile
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return Response({"success": False, "message": "User not found. Please register first."}, status=status.HTTP_404_NOT_FOUND)

    # Check OTP validity
    if profile.otp != otp_entered:
        return Response({"success": False, "message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    # Check OTP expiration (e.g., 5 minutes)
    if timezone.now() > profile.otp_created_at + timedelta(minutes=5):
        return Response({"success": False, "message": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

    # Activate user and clear OTP
    user.is_active = True
    user.save()
    profile.email_verified = True
    profile.otp = None
    profile.otp_created_at = None
    profile.save()

    # Get tokens for the newly activated user
    tokens = get_tokens_for_user(user)
    return Response({
        "success": True,
        "message": "Email verified and registration successful!",
        "token": tokens['access'],
    }, status=status.HTTP_200_OK)

    User = get_user_model()
    data = request.data
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return Response({"success": False, "message": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"success": False, "message": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=email, email=email, password=password, first_name=name or "")
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        tokens = get_tokens_for_user(user)
        return Response({
            "success": True,
            "message": "User registered successfully.",
            "token": tokens['access'],
            "refresh": tokens['refresh'],
            "name": user.first_name,
            "email": user.email
        }, status=status.HTTP_201_CREATED)
    except Exception:
        return Response({"success": False, "message": "Something went wrong. Try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    User = get_user_model()
    data = request.data
    email = data.get('email')
    password = data.get('password')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"success": False, "message": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user_obj.username, password=password)
    if user is not None:
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        tokens = get_tokens_for_user(user)
        return Response({
            "success": True,
            "token": tokens['access'],
            "refresh": tokens['refresh'],
            "name": user.first_name,
            "email": user.email
        })
    else:
        return Response({"success": False, "message": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

# Profile 

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def user_profile(request):
    """
    Handles GET and PUT requests for a user's profile.
    This view is now more robust and will create a profile if it doesn't exist.
    """
    # ❗ KEY FIX: Use get_or_create to prevent errors if a profile is missing.
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response({"success": True, "userData": serializer.data})

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Profile updated successfully",
                "userData": serializer.data
            })
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    user = request.user
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        return Response({"success": False, "message": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response({"success": True, "userData": serializer.data})

    elif request.method == 'PUT':
        mutable_data = request.data.copy()
        mutable_data.pop('email', None)
        mutable_data.pop('name', None)
        serializer = UserProfileSerializer(profile, data=mutable_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Profile updated successfully",
                "userData": serializer.data
            })
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.csrf import csrf_exempt
from .models import Appointment, HospitalAdmin


@csrf_exempt
@login_required
@user_passes_test(lambda u: u.is_superuser or HospitalAdmin.objects.filter(user=u).exists())
def admin_cancel_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)

    # Check hospital ownership if not superuser
    if not request.user.is_superuser:
        try:
            hospital_admin = HospitalAdmin.objects.get(user=request.user)
            if appointment.doctor.hospital != hospital_admin.hospital:
                return JsonResponse({'error': 'You do not have permission to cancel this appointment.'}, status=403)
        except HospitalAdmin.DoesNotExist:
            return JsonResponse({'error': 'Unauthorized'}, status=403)

    # Cancel the appointment
    appointment.status = 'canceled'
    appointment.save()

    # Redirect back to admin appointment list
    return HttpResponseRedirect('/admin/hospital/appointment/')


import uuid
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny]) # Anyone can view available slots
def get_available_slots(request):
    doctor_id = request.query_params.get('doctor_id')
    date_str = request.query_params.get('date') # Expects 'YYYY-MM-DD'

    if not doctor_id or not date_str:
        return Response({"error": "doctor_id and date are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        doctor = Doctor.objects.get(id=doctor_id)
        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        day_of_week = selected_date.strftime("%A") # e.g., "Monday"
    except (Doctor.DoesNotExist, ValueError):
        return Response({"error": "Invalid doctor_id or date format."}, status=status.HTTP_400_BAD_REQUEST)

    # Get all available time slots for that day of the week
    try:
        day_obj = Day.objects.get(name=day_of_week)
        if day_obj not in doctor.available_days.all():
            return Response([], status=status.HTTP_200_OK) # Doctor not available on this day

        available_slots = doctor.available_times.all()
    except Day.DoesNotExist:
        return Response([], status=status.HTTP_200_OK) # Day not configured in system

    # Get all appointments already booked for that doctor on that date
    booked_appointments = Appointment.objects.filter(
        doctor=doctor,
        appointment_datetime__date=selected_date
    )
    booked_times = [appt.appointment_datetime.time() for appt in booked_appointments]

    # Filter out the booked slots
    free_slots = [slot for slot in available_slots if slot.time not in booked_times]

    # Serialize the remaining free slots
    serializer = TimeSlotSerializer(free_slots, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_esewa_payment(request):
    appointment_id = request.data.get('appointment_id')
    if not appointment_id:
        return Response({"error": "Appointment ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

    # Use the specific OPD charge for the hospital where the appointment is booked
    try:
        doctor_hospital_link = DoctorHospital.objects.get(doctor=appointment.doctor, hospital=appointment.hospital)
        amount = doctor_hospital_link.opd_charge
    except DoctorHospital.DoesNotExist:
        # Fallback to the doctor's default fee if the specific charge isn't set
        amount = appointment.doctor.fees

    transaction_uuid = str(uuid.uuid4())
    secret_key = "8gBm/:&EnhH.1/q" # This is the eSewa TEST secret key

    # The message to be signed
    message = f"total_amount={amount},transaction_uuid={transaction_uuid},product_code=EPAYTEST"

    # Create the HMAC-SHA256 signature
    signature = base64.b64encode(hmac.new(
        secret_key.encode('utf-8'),
        message.encode('utf-8'),
        digestmod=hashlib.sha256
    ).digest()).decode('utf-8')

    # Data to be sent back to the frontend
    payment_data = {
        "esewa_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        "form_data": {
            "amount": str(amount),
            "tax_amount": "0",
            "total_amount": str(amount),
            "transaction_uuid": transaction_uuid,
            "product_code": "EPAYTEST",
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": "http://localhost:5173/payment-success",
            "failure_url": "http://localhost:5173/payment-failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        }
    }
    
    # Store the transaction_uuid on the appointment to verify it later
    appointment.payment_transaction_id = transaction_uuid
    appointment.save()

    return Response(payment_data, status=status.HTTP_200_OK)
    appointment_id = request.data.get('appointment_id')
    if not appointment_id:
        return Response({"error": "Appointment ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

    # Use the specific OPD charge for the hospital where the appointment is booked
    try:
        doctor_hospital_link = DoctorHospital.objects.get(doctor=appointment.doctor, hospital=appointment.hospital)
        amount = doctor_hospital_link.opd_charge
    except DoctorHospital.DoesNotExist:
        # Fallback to the doctor's default fee if the specific charge isn't set
        amount = appointment.doctor.fees

    transaction_uuid = str(uuid.uuid4())
    secret_key = "8gBm/:&EnhH.1/q" # This is the eSewa TEST secret key

    # The message to be signed
    message = f"total_amount={amount},transaction_uuid={transaction_uuid},product_code=EPAYTEST"

    # Create the HMAC-SHA256 signature
    signature = base64.b64encode(hmac.new(
        secret_key.encode('utf-8'),
        message.encode('utf-8'),
        digestmod=hashlib.sha256
    ).digest()).decode('utf-8')

    # Data to be sent back to the frontend
    payment_data = {
        "esewa_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        "form_data": {
            "amount": str(amount),
            "tax_amount": "0",
            "total_amount": str(amount),
            "transaction_uuid": transaction_uuid,
            "product_code": "EPAYTEST",
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": "http://localhost:5173/payment-success",
            "failure_url": "http://localhost:5173/payment-failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        }
    }
    
    # Store the transaction_uuid on the appointment to verify it later
    appointment.payment_transaction_id = transaction_uuid
    appointment.save()

    return Response(payment_data, status=status.HTTP_200_OK)


# --- ADD THIS NEW VIEW TO VERIFY THE PAYMENT ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_esewa_payment(request):
    transaction_uuid = request.data.get('transaction_uuid')
    
    if not transaction_uuid:
        return Response({"error": "Transaction UUID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        appointment = Appointment.objects.get(payment_transaction_id=transaction_uuid, patient=request.user)
        
        # --- START: KEY FIX ---
        # 1. Get the correct OPD charge for this specific appointment
        try:
            doctor_hospital_link = DoctorHospital.objects.get(doctor=appointment.doctor, hospital=appointment.hospital)
            amount_paid = doctor_hospital_link.opd_charge
        except DoctorHospital.DoesNotExist:
            # Fallback to the doctor's default fee if the specific charge isn't set
            amount_paid = appointment.doctor.fees

        # 2. Update all the necessary payment fields
        appointment.payment_status = True
        appointment.payment_method = 'eSewa'
        appointment.status = 'booked'
        appointment.payment_amount = amount_paid # This was the missing line
        appointment.save()
        # --- END: KEY FIX ---
        
        return Response({"message": "Payment verified successfully."}, status=status.HTTP_200_OK)
        
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment for this transaction not found."}, status=status.HTTP_404_NOT_FOUND)



class SpecialtyListAPI(APIView):
    """
    API endpoint for listing all available doctor specialties.
    """
    permission_classes = [AllowAny]
    def get(self, request):
        specialties = Specialty.objects.all().order_by('name')
        serializer = SpecialtySerializer(specialties, many=True)
        return Response(serializer.data)

class GlobalSearchAPI(APIView):
    """
    Searches across Doctors and Hospitals based on a query parameter.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('query', '')
        
        if not query:
            return Response({'doctors': [], 'hospitals': []})

        # Search doctors by name or specialty name
        doctors = Doctor.objects.filter(
            Q(name__icontains=query) | Q(specialty__name__icontains=query)
        ).distinct()

        # Search hospitals by name or location
        hospitals = Hospital.objects.filter(
            Q(name__icontains=query) | Q(location__icontains=query)
        ).distinct()

        doctor_serializer = DoctorSerializer(doctors, many=True, context={'request': request})
        hospital_serializer = HospitalSerializer(hospitals, many=True, context={'request': request})

        return Response({
            'doctors': doctor_serializer.data,
            'hospitals': hospital_serializer.data,
        })

class AdminDashboardStatsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "You are not authorized to view this page."}, status=status.HTTP_403_FORBIDDEN)

        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=7)

        appointments = Appointment.objects.filter(hospital=hospital)
        todays_appointments = appointments.filter(appointment_datetime__gte=today, appointment_datetime__lt=tomorrow)
        upcoming_appointments = appointments.filter(appointment_datetime__gte=tomorrow, appointment_datetime__lt=next_week)
        
        todays_revenue = todays_appointments.filter(
            status='completed', 
            payment_status=True
        ).aggregate(total=Sum('payment_amount'))['total'] or 0 # ❗ KEY FIX #1 again: Using Sum correctly

        pending_payments = appointments.filter(
            status='booked', 
            payment_status=False
        ).count()

        stats = {
            'hospital_name': hospital.name,
            'todays_appointments_count': todays_appointments.count(),
            'upcoming_appointments_count': upcoming_appointments.count(),
            'todays_revenue': f"{todays_revenue:.2f}",
            'pending_payments_count': pending_payments,
            'todays_schedule': AdminAppointmentSerializer(todays_appointments.order_by('appointment_datetime'), many=True).data
        }
        return Response(stats)
    """
    Provides key statistics for the hospital admin dashboard homepage.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Ensure the logged-in user is a hospital admin
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "You are not authorized to view this page."}, status=status.HTTP_403_FORBIDDEN)

        # Get today's date range
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=7)

        # Filter appointments for the admin's hospital
        appointments = Appointment.objects.filter(hospital=hospital)

        # Calculate stats
        todays_appointments = appointments.filter(appointment_datetime__gte=today, appointment_datetime__lt=tomorrow)
        upcoming_appointments = appointments.filter(appointment_datetime__gte=tomorrow, appointment_datetime__lt=next_week)
        
        # Calculate revenue from today's completed and paid appointments
        todays_revenue = todays_appointments.filter(
            status='completed', 
            payment_status=True
        ).aggregate(total=models.Sum('payment_amount'))['total'] or 0

        pending_payments = appointments.filter(
            status='booked', 
            payment_status=False
        ).count()

        stats = {
            'hospital_name': hospital.name,
            'todays_appointments_count': todays_appointments.count(),
            'upcoming_appointments_count': upcoming_appointments.count(),
            'todays_revenue': f"{todays_revenue:.2f}",
            'pending_payments_count': pending_payments,
            'todays_schedule': AdminAppointmentSerializer(todays_appointments.order_by('appointment_datetime'), many=True).data
        }

        return Response(stats)


class AdminAllAppointmentsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "You are not authorized to view this page."}, status=status.HTTP_403_FORBIDDEN)

        queryset = Appointment.objects.filter(hospital=hospital).order_by('-appointment_datetime')

        doctor_id = request.query_params.get('doctor_id')
        status_filter = request.query_params.get('status')
        payment_status_filter = request.query_params.get('payment_status')
        
        if doctor_id:
            queryset = queryset.filter(doctor__id=doctor_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status_filter is not None:
            is_paid = payment_status_filter.lower() == 'true'
            queryset = queryset.filter(payment_status=is_paid)
            
        serializer = AdminAppointmentSerializer(queryset, many=True)
        return Response(serializer.data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request):
    """
    Allows a hospital admin to update the status of an appointment.
    """
    appointment_id = request.data.get('appointment_id')
    new_status = request.data.get('status')

    if not all([appointment_id, new_status]):
        return Response(
            {"error": "Appointment ID and new status are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Security Check: Ensure the admin belongs to the hospital of the appointment
        admin = HospitalAdmin.objects.get(user=request.user)
        appointment = Appointment.objects.get(id=appointment_id, hospital=admin.hospital)
        
        appointment.status = new_status
        appointment.save()
        
        return Response({"success": "Status updated successfully."})

    except HospitalAdmin.DoesNotExist:
        return Response({"error": "You are not authorized for this action."}, status=status.HTTP_403_FORBIDDEN)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found or you do not have permission to edit it."}, status=status.HTTP_404_NOT_FOUND)
    
class AdminDashboardChartsAPI(APIView):
    """
    Provides aggregated data for charts on the admin dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)

        # 1. Data for "Appointments by Doctor" chart
        doctor_data = Appointment.objects.filter(hospital=hospital)\
            .values('doctor__name')\
            .annotate(count=Count('id'))\
            .order_by('-count')

        # 2. Data for "Appointment Status Breakdown" chart
        status_data = Appointment.objects.filter(hospital=hospital)\
            .values('status')\
            .annotate(count=Count('id'))\
            .order_by('status')

        chart_data = {
            'appointments_by_doctor': list(doctor_data),
            'appointments_by_status': list(status_data),
        }

        return Response(chart_data)
class ListUnassignedDoctorsAPI(APIView):
    """
    Lists all doctors who are not currently assigned to the admin's hospital.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)

        assigned_doctor_ids = DoctorHospital.objects.filter(hospital=hospital).values_list('doctor_id', flat=True)
        unassigned_doctors = Doctor.objects.exclude(id__in=assigned_doctor_ids)
        
        serializer = DoctorSerializer(unassigned_doctors, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_existing_doctor_to_hospital(request):
    """
    Adds an existing doctor to the admin's hospital roster.
    """
    doctor_id = request.data.get('doctor_id')
    opd_charge = request.data.get('opd_charge')

    if not all([doctor_id, opd_charge]):
        return Response({"error": "Doctor ID and OPD charge are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        admin = HospitalAdmin.objects.get(user=request.user)
        doctor = Doctor.objects.get(id=doctor_id)

        # Create the link between the doctor and the hospital
        DoctorHospital.objects.create(
            doctor=doctor,
            hospital=admin.hospital,
            opd_charge=opd_charge
        )
        return Response({"success": f"Dr. {doctor.name} has been added to {admin.hospital.name}."})

    except HospitalAdmin.DoesNotExist:
        return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)
    except Doctor.DoesNotExist:
        return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    except IntegrityError:
        return Response({"error": "This doctor is already in your hospital."}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser]) # ✅ KEY FIX: Add this decorator
def create_and_add_doctor_to_hospital(request):
    """
    Creates a new doctor and adds them to the admin's hospital roster.
    """
    # ... The rest of the function logic is correct and does not need to be changed
    opd_charge = request.data.get('opd_charge')
    if not opd_charge:
        return Response({"error": "OPD charge is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = DoctorCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            
            validated_data = serializer.validated_data
            
            validated_data['password'] = make_password(validated_data['password'])

            new_doctor = Doctor.objects.create(**validated_data)
           
            DoctorHospital.objects.create(
                doctor=new_doctor,
                hospital=admin.hospital,
                opd_charge=opd_charge
            )
            return Response({"success": f"Dr. {new_doctor.name} created and added to your hospital."}, status=status.HTTP_201_CREATED)

        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)
        except IntegrityError:
            return Response({"error": "A doctor with that NMC number or email already exists."}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    Creates a new doctor and adds them to the admin's hospital roster.
    """
    opd_charge = request.data.get('opd_charge')
    if not opd_charge:
        return Response({"error": "OPD charge is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = DoctorCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            
            # --- START: KEY FIX ---
            # 1. Get the validated data from the serializer
            validated_data = serializer.validated_data
            
            # 2. Manually hash the default password
            validated_data['password'] = make_password('doctordefault123')

            # 3. Create the doctor instance with the hashed password
            new_doctor = Doctor.objects.create(**validated_data)
            # --- END: KEY FIX ---

            # Link the new doctor to the hospital
            DoctorHospital.objects.create(
                doctor=new_doctor,
                hospital=admin.hospital,
                opd_charge=opd_charge
            )
            return Response({"success": f"Dr. {new_doctor.name} created and added to your hospital."}, status=status.HTTP_201_CREATED)

        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    Creates a new doctor and adds them to the admin's hospital roster.
    """
    opd_charge = request.data.get('opd_charge')
    if not opd_charge:
        return Response({"error": "OPD charge is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    serializer = DoctorCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            
            # --- START: KEY FIX ---
            # 1. Save the serializer to create the doctor instance
            new_doctor = serializer.save()

            # 2. Set a default password for the new doctor
            # Note: In a real app, you might want a more secure way to handle this
            new_doctor.set_password('doctordefault123')
            new_doctor.save() # Save the doctor again to store the hashed password
            # --- END: KEY FIX ---

            # Link the new doctor to the hospital
            DoctorHospital.objects.create(
                doctor=new_doctor,
                hospital=admin.hospital,
                opd_charge=opd_charge
            )
            return Response({"success": f"Dr. {new_doctor.name} created and added to your hospital."}, status=status.HTTP_201_CREATED)

        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class DoctorScheduleAPI(APIView):
    """
    API for fetching and updating a doctor's weekly schedule.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, doctor_id):
        try:
            # Security check: ensure the doctor belongs to the admin's hospital
            admin = HospitalAdmin.objects.get(user=request.user)
            doctor = Doctor.objects.get(id=doctor_id, hospitals=admin.hospital)

            # Get all possible days and times to populate the form
            all_days = Day.objects.all()
            all_times = TimeSlot.objects.all()

            # Get the doctor's currently selected schedule
            current_days = doctor.available_days.all()
            current_times = doctor.available_times.all()

            # Serialize the data
            response_data = {
                'doctor_name': doctor.name,
                'all_options': {
                    'days': DaySerializer(all_days, many=True).data,
                    'times': TimeSlotSerializer(all_times, many=True).data,
                },
                'current_schedule': {
                    'day_ids': [day.id for day in current_days],
                    'time_ids': [time.id for time in current_times],
                }
            }
            return Response(response_data)

        except (HospitalAdmin.DoesNotExist, Doctor.DoesNotExist):
            return Response({"error": "Unauthorized or Doctor not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, doctor_id):
        day_ids = request.data.get('day_ids', [])
        time_ids = request.data.get('time_ids', [])

        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            doctor = Doctor.objects.get(id=doctor_id, hospitals=admin.hospital)

            # Update the schedule
            doctor.available_days.set(day_ids)
            doctor.available_times.set(time_ids)

            return Response({"success": "Doctor's schedule updated successfully."})
        
        except (HospitalAdmin.DoesNotExist, Doctor.DoesNotExist):
            return Response({"error": "Unauthorized or Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
class AdminHospitalDoctorsAPI(APIView):
    """
    Provides a list of doctors specifically for the logged-in admin's hospital.
    """
    # ❗ KEY FIX: Make sure this line and the 'def get' below are indented
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            admin = HospitalAdmin.objects.get(user=request.user)
            hospital = admin.hospital
            
            # Filter doctors that are linked to this specific hospital
            doctors_in_hospital = Doctor.objects.filter(hospitals=hospital)
            
            serializer = DoctorSerializer(doctors_in_hospital, many=True, context={'request': request})
            return Response(serializer.data)
            
        except HospitalAdmin.DoesNotExist:
            return Response({"error": "Authorization failed."}, status=status.HTTP_403_FORBIDDEN)