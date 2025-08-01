from django.contrib import admin
from .models import (
    Hospital,
    Doctor,
    HospitalAdmin,
    Appointment,
    UserProfile,
    Day,
    TimeSlot,
    DoctorHospital,
    Specialty,
)

# --- Admin class for Hospitals ---
@admin.register(Hospital)
class HospitalModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'phone_number', 'website')
    search_fields = ('name', 'location')

# --- Inline editor for the Doctor-Hospital relationship ---
class DoctorHospitalInline(admin.TabularInline):
    model = DoctorHospital
    extra = 1  # Provides one empty slot to add a new hospital affiliation

# --- Admin class for Doctors ---
@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    inlines = [DoctorHospitalInline]
    # REVERTED: 'specialty' is now treated as a simple text field.
    list_display = ('name', 'specialty', 'nmc_no')
    search_fields = ('name', 'specialty', 'nmc_no')
    list_filter = ('specialty',)

    # Your custom logic to filter doctors for Hospital Admins
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Superusers see all doctors
        if request.user.is_superuser:
            return qs
        # Hospital Admins only see doctors linked to their hospital
        try:
            hospital_admin = request.user.hospitaladmin
            return qs.filter(hospitals=hospital_admin.hospital)
        except HospitalAdmin.DoesNotExist:
            return qs.none()

# --- Admin class for Appointments ---
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'get_patient_name', 'get_doctor_name', 'hospital',
        'appointment_datetime', 'status', 'payment_status'
    )
    list_filter = ('status', 'payment_status', 'doctor', 'hospital')
    search_fields = ('patient__username', 'doctor__name')
    ordering = ('-appointment_datetime',)

    def get_patient_name(self, obj):
        return obj.patient.username
    get_patient_name.short_description = 'Patient'

    def get_doctor_name(self, obj):
        return obj.doctor.name
    get_doctor_name.short_description = 'Doctor'

    # Your custom logic to filter appointments for Hospital Admins
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        try:
            hospital_admin = request.user.hospitaladmin
            return qs.filter(hospital=hospital_admin.hospital)
        except HospitalAdmin.DoesNotExist:
            return qs.none()

# --- Registering the rest of your models ---
admin.site.register(Specialty)
admin.site.register(HospitalAdmin)
admin.site.register(Day)
admin.site.register(TimeSlot)
admin.site.register(UserProfile)