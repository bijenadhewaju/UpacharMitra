from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # ViewSets
    HospitalViewSet,
    DoctorViewSet,

    # Class-Based API Views
    SpecialtyListAPI,
    GlobalSearchAPI,
    HospitalAdminAppointmentsView,

    # Function-Based API Views
    register_user,
    verify_otp_and_activate_user,
    login_user,
    user_profile,
    myappointment,
    book_appointment,
    cancel_appointment,
    get_available_slots,
    initiate_esewa_payment,
    verify_esewa_payment,
    update_appointment_status,
    admin_cancel_appointment,
     AdminDashboardStatsAPI,
    AdminAllAppointmentsAPI,
    update_appointment_status,
    AdminDashboardChartsAPI,
    ListUnassignedDoctorsAPI,
    PredictSpecialtyView,
    suggest_doctor,
    add_existing_doctor_to_hospital,
    create_and_add_doctor_to_hospital,
    DoctorScheduleAPI,
    AdminHospitalDoctorsAPI,
)

# Using a router for standard model views is best practice.
# This creates routes like /api/hospitals/ and /api/doctors/
router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'doctors', DoctorViewSet, basename='doctor')

# This is the final, clean list of all your API endpoints
urlpatterns = [
    # Router-generated URLs
    path('', include(router.urls)),

    # --- Authentication & User Profile ---
    path('user/register/', register_user, name='register-user'),
    path('user/verify-otp/', verify_otp_and_activate_user, name='verify-otp'),
    path('user/login/', login_user, name='login-user'),
    path('user/profile/', user_profile, name='user-profile'),
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- Core Data Endpoints ---
    path('specialties/', SpecialtyListAPI.as_view(), name='specialty-list'),
    path('search/', GlobalSearchAPI.as_view(), name='global-search'),
    path('available-slots/', get_available_slots, name='available-slots'),

# chat
    path("predict-specialty/", PredictSpecialtyView.as_view(), name="predict_specialty"),
    path("suggest-doctor/", suggest_doctor, name="suggest-doctor"),

    # --- Appointment & Payment Flow ---
    path('my-appointments/', myappointment, name='my-appointments'),
    path('book-appointment/', book_appointment, name='book-appointment'),
    path('cancel-appointment/', cancel_appointment, name='cancel-appointment'),
    path('initiate-payment/', initiate_esewa_payment, name='initiate-payment'),
    path('verify-payment/', verify_esewa_payment, name='verify-payment'),
    
    # --- Hospital Admin Routes ---
    path('hospital-appointments/', HospitalAdminAppointmentsView.as_view(), name='hospital-appointments'),
    path('update-appointment-status/', update_appointment_status, name='update-appointment-status'),
    path('admin/cancel-appointment/<int:appointment_id>/', admin_cancel_appointment, name='admin-cancel-appointment'),
    path('admin/dashboard-stats/', AdminDashboardStatsAPI.as_view(), name='admin-dashboard-stats'),
    path('admin/all-appointments/', AdminAllAppointmentsAPI.as_view(), name='admin-all-appointments'),
    path('admin/update-appointment-status/', update_appointment_status, name='admin-update-status'),
    path('admin/dashboard-charts/', AdminDashboardChartsAPI.as_view(), name='admin-dashboard-charts'),
    path('admin/unassigned-doctors/', ListUnassignedDoctorsAPI.as_view(), name='admin-unassigned-doctors'),
    path('admin/add-existing-doctor/', add_existing_doctor_to_hospital, name='admin-add-existing-doctor'),
    path('admin/create-doctor/', create_and_add_doctor_to_hospital, name='admin-create-doctor'),
    path('admin/doctors/<int:doctor_id>/schedule/', DoctorScheduleAPI.as_view(), name='admin-doctor-schedule'),
    path('admin/my-doctors/', AdminHospitalDoctorsAPI.as_view(), name='admin-my-doctors'),
]