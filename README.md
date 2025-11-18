# Secure File Upload App  
Block malware at upload time using Cloudinary + Perception Point.

This project shows how to upload files with the Cloudinary Upload Widget, scan every upload for malware using the Perception Point add-on, and update the UI when the scan completes.  
The backend uses Express, and the app can be deployed to Vercel.

---

## Features

- Upload any file using the Cloudinary Upload Widget  
- Automatic malware scanning with the Perception Point add-on  
- Webhook integration to receive scan results  
- Live polling to update file status (Pending, Approved, Rejected)  
- Express backend with health and debug endpoints  
- Ready for Vercel deployment  
- Responsive UI built with HTML, CSS, and JavaScript

---

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript  
- **Backend**: Node.js, Express  
- **Cloud Platform**: Cloudinary  
- **Deployment**: Vercel  
- **Security**: Perception Point Malware Detection

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/musebe/secure-upload-app
cd secure-upload-app
