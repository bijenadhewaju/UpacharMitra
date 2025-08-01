from django.db import models
from django.contrib.auth.models import User

# Days of the week choices
DAYS_OF_WEEK = [
    ('Sunday', 'Sunday'),
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
]


# Hospital Model
# backend_django/hospital/models.py
class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # We will store the path to an icon image for each specialty.
    icon = models.ImageField(upload_to='specialty_icons/', blank=True, null=True)

    def __str__(self):
        return self.name
class Hospital(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='hospital_logos/', blank=True, null=True)
    def __str__(self):
        return self.name
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    # --- NEW FIELDS ---
    description = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='hospital_logos/', blank=True, null=True)

    def __str__(self):
        return self.name
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


# Hospital Admin
class HospitalAdmin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} ({self.hospital.name})"


# Day Model
class Day(models.Model):
    name = models.CharField(max_length=10, choices=DAYS_OF_WEEK, unique=True)

    def __str__(self):
        return self.name


# Time Slot Model
class TimeSlot(models.Model):
    time = models.TimeField(unique=True)

    def __str__(self):
        return self.time.strftime('%I:%M %p')


# Doctor Model
class Doctor(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)   
    nmc_no = models.CharField(max_length=50, unique=True)
    degree = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    about = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='doctors/', blank=True, null=True)
    hospitals = models.ManyToManyField(Hospital, through='DoctorHospital')
    available_days = models.ManyToManyField('Day', blank=True)
    available_times = models.ManyToManyField('TimeSlot', blank=True)
    def __str__(self):
        return f"Dr. {self.name}"
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)
    nmc_no = models.CharField(max_length=50, unique=True)
    degree = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    about = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='doctors/', blank=True, null=True)
    hospitals = models.ManyToManyField(Hospital, through='DoctorHospital')
    

    available_days = models.ManyToManyField(Day, blank=True)
    available_times = models.ManyToManyField(TimeSlot, blank=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialty})"
class DoctorHospital(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    opd_charge = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        # Ensures a doctor can't be listed twice for the same hospital
        unique_together = ('doctor', 'hospital')

    def __str__(self):
        return f"{self.doctor} at {self.hospital} - Rs. {self.opd_charge}"


# Appointment Model
class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    appointment_datetime = models.DateTimeField()

    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')

    # Payment fields
    payment_status = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_paid(self):
        return self.payment_status

    def is_completed(self):
        return self.status == 'completed'

    def is_cancelled(self):
        return self.status == 'canceled'

    def save(self, *args, **kwargs):
        if not self.hospital and self.doctor:
            self.hospital = self.doctor.hospital
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient.username} with Dr. {self.doctor.name} on {self.appointment_datetime}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['patient', 'doctor', 'appointment_datetime'],
                name='unique_patient_doctor_datetime'
            )
        ]


class UserProfile(models.Model):
    """Extends the default Django User model with profile and OTP fields."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    gender = models.CharField(max_length=10, blank=True)
    birthday = models.DateField(null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    # OTP and verification fields
    email_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.user.username