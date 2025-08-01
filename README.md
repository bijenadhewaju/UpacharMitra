#  UpacharMitra – AI-Powered Hospital Appointment System

UpacharMitra is a web-based hospital appointment booking system integrated with an AI-powered chatbot. It helps users identify the correct medical department based on their symptoms and book appointments with suitable doctors across multiple hospitals.

---

##  Features

- **AI Chatbot(Mitra)** – Suggests medical departments based on user symptoms using a fine-tuned NLP model.
- **Appointment Booking** – Book appointments with doctors across multiple hospitals with availability and pricing info.
- **Multi-Hospital Support** – Scalable backend structure for multi-doctor, multi-hospital systems.
- **User Authentication** – Secure login and registration.
- **Admin Panel** – Manage hospitals, doctors, appointments, and schedules.

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Django, Django REST Framework
- **Database**: SQLite
- **AI/ML**: Hugging Face Transformers (BERT-based model)
- **Model Repo**: [bijenadhewaju/distilbert_medical_speciality](https://huggingface.co/bijenadhewaju/distilbert_medical_speciality)

---

## AI Model

The chatbot uses a transformer-based NLP model fine-tuned to classify user symptoms into relevant medical specialties. The model is deployed via the Hugging Face Inference API and is queried in real time to guide patients.

---

## Team & Roles

- **[Bijena Dhewaju](https://github.com/bijenadhewaju)**  
  *Team Lead & Frontend Developer*  
  - Fine-tuned and deployed the AI model using Hugging Face  
  - Integrated chatbot with Django REST API  
  - Built the frontend along with team members using React and Tailwind CSS  
  - Led the team, coordinated development tasks, and designed the backend schema

- **[Oshin Tamang](https://github.com/oshintmg)**  
  *Backend Developer*  
  - Contributed to API development using Django REST Framework  
  - Assisted in database design and user authentication

- **[Preeti Gurung](https://github.com/preetygurung)**  
  *Frontend & Design Support*  
  - Contributed to frontend styling and responsiveness  
  - Helped refine the chatbot interface and user experience

---

## Setup Instructions

### Backend

```bash
cd backend
python -m venv env
env\Scripts\activate 
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```


