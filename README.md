# CMI RVW (Image Review)

A modern web application built for BorgWarner to review and verify faults on scanned units using overlay images (SVG).

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4
- **Backend**: NestJS, TypeScript
- **Deployment**: Docker, Multi-stage builds, Docker Compose
- **Storage**: Samba (CIFS) network share used to fetch overlay images (SVG)

## 📋 Key Features

- **Unit Scanning**: Scan a unit's serial number to retrieve its process history and potential faults.
- **Image Review**: Interactive review process for each detected fault. Displays SVG overlays fetched from a network drive.
- **Decision Making**: Simple and clear OK/NOK buttons to evaluate each step.
- **Result Submission**: Saves the final verification result (DataEntry) to the core tracking system.
- **Theming**: Built-in support for Dark and Light modes.

## 🛠️ Project Structure

- `/frontend/` - React client application
- `/backend/` - NestJS server application (acts as a proxy to the main API and serves static files in the production environment)
- `Dockerfile.prod` - Optimized multi-stage Dockerfile that builds the entire application
- `docker-compose.prod.yml` - Docker Compose configuration for the production environment
- `mount_samba.sh` - Helper script to mount the required network drive on the host machine

## ⚙️ Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run start:dev
```

## 🚢 Production Deployment

The application is deployed as a single Docker container where NestJS serves both the API endpoints and the built frontend static files.

1. **Mount the Samba Share**
   The application requires access to a network drive to load SVG overlays. The share must be mounted on the host machine:
   ```bash
   chmod +x mount_samba.sh
   sudo ./mount_samba.sh
   ```

2. **Start the Container**
   Use Docker Compose to build and run the application in the background:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

The application will be accessible at `http://<server-address>:3001`.

## 👨‍💻 Author

Designed and developed by:
**Mateusz Zielinski**  
BorgWarner
