from rest_framework import serializers

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Doctor, Hospital, Appointment, UserProfile, Day, TimeSlot, DoctorHospital, Specialty, HospitalAdmin # Ensure correct model names, no duplicates
)

# --- Specialty Serializer ---
class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'icon']

# --- Other Serializers ---



class DoctorHospitalSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    hospital_id = serializers.IntegerField(source='hospital.id', read_only=True)
    class Meta:
        model = DoctorHospital
        fields = ['hospital_id', 'hospital_name', 'opd_charge']


class DoctorSerializer(serializers.ModelSerializer):
    # ❗ FIX #1: This is a safer way to get the specialty name.
    # It returns the name as a string or null if no specialty is assigned, preventing crashes.
    specialty = serializers.CharField(source='specialty.name', read_only=True, allow_null=True)
    
    hospitals = DoctorHospitalSerializer(source='doctorhospital_set', many=True, read_only=True)
    available_days = serializers.StringRelatedField(many=True)
    available_times = serializers.StringRelatedField(many=True)
    class Meta:
        model = Doctor
        fields = [
            'id', 'name', 'specialty', 'photo', 'about', 'fees',
            'hospitals', 'available_days', 'available_times'
        ]

    def get_available_times(self, obj):
        return [ts.time.strftime("%I:%M %p") for ts in obj.available_times.all()]
class HospitalSerializer(serializers.ModelSerializer):
    doctors = DoctorSerializer(many=True, read_only=True)
    class Meta:
        model = Hospital
        # ❗ FIX #2: You were missing 'doctors' in this list.
        fields = [
            'id', 'name', 'location', 'description', 'phone_number', 
            'email', 'website', 'logo', 'doctors'
        ]     
# --- NEW: TimeSlotSerializer (Moved to top level) ---
class TimeSlotSerializer(serializers.ModelSerializer): # <--- Moved outside UserProfileSerializer
    class Meta:
        model = TimeSlot
        fields = '__all__' # Or specify fields like ['id', 'time']
# --- End of NEW Serializer ---

class PatientAppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_photo = serializers.ImageField(source='doctor.photo', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty.name', read_only=True, allow_null=True)
    doctor_address = serializers.CharField(source='doctor.address', read_only=True)
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    cancelled = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor_name', 'doctor_photo', 'doctor_specialty',
            'doctor_address', 'date', 'time', 'cancelled', 'payment',
        ]

    def get_date(self, obj):
        return obj.appointment_datetime.date()

    def get_time(self, obj):
        return obj.appointment_datetime.strftime("%H:%M")

    def get_cancelled(self, obj):
        return obj.status.lower() in ['canceled', 'cancelled']

    def get_payment(self, obj):
        return bool(obj.payment_status)

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    patient_profile_pic = serializers.ImageField(source='patient.profile.profile_pic', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_photo = serializers.ImageField(source='doctor.photo', read_only=True)
    doctor_fees = serializers.SerializerMethodField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'patient_profile_pic', 'doctor_name',
            'doctor_photo', 'doctor_fees', 'hospital_name', 'appointment_datetime', 'status', 'payment_status'
        ]
    
    def get_doctor_fees(self, obj):
        try:
            doctor_hospital_link = DoctorHospital.objects.get(doctor=obj.doctor, hospital=obj.hospital)
            return doctor_hospital_link.opd_charge
        except DoctorHospital.DoesNotExist:
            return obj.doctor.fees

class UserProfileSerializer(serializers.ModelSerializer):
    # These fields get data from the related User model
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.CharField(source='user.first_name', read_only=True)
    is_hospital_admin = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
       
        fields = [
            'email',
            'name',
            'is_hospital_admin',
            'phone',
            'address',
            'gender',
            'birthday',
            'profile_pic',
            'email_verified',
        ]

    def get_is_hospital_admin(self, obj):
        # This correctly checks if a HospitalAdmin entry exists for the user
        return HospitalAdmin.objects.filter(user=obj.user).exists()

    def update(self, instance, validated_data):
        # Your update logic is correct
        for attr in ['phone', 'address', 'gender', 'birthday', 'profile_pic']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        instance.save()
        return instance
class AdminDoctorSerializer(serializers.ModelSerializer):
    """A simple serializer for listing doctor names."""
    class Meta:
        model = Doctor
        fields = ['id', 'name']

class AdminPatientSerializer(serializers.ModelSerializer):
    """A simple serializer for patient details in the appointment list."""
    class Meta:
        model = User # This will now work correctly
        fields = ['id', 'first_name', 'last_name', 'email']

class AdminAppointmentSerializer(serializers.ModelSerializer):
    """A detailed serializer for the admin appointment management table."""
    doctor = AdminDoctorSerializer(read_only=True)
    patient = AdminPatientSerializer(read_only=True)
    hospital = serializers.StringRelatedField()

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'doctor',
            'hospital',
            'appointment_datetime',
            'status',
            'payment_status',
            'payment_method',
            'payment_amount',
        ]
class DoctorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Doctor
        # ✅ KEY FIX: Add 'photo' to the list of fields
        fields = ['name', 'email', 'specialty', 'fees', 'about', 'nmc_no', 'password', 'photo']
class DaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Day
        fields = ['id', 'name']