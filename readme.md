# Collision Detection System Using ESP32, Node.js, and React

## Project Overview

This project is a **Collision Detection System** that utilizes an ESP32 microcontroller equipped with an MPU6050 sensor and an impact sensor (YL-99) to detect accidents or collisions. The system records data such as **impact level**, **orientation**, **temperature**, and **location**, and sends it to a **Node.js backend** via HTTP. The backend stores the data in a MongoDB database, notifies connected clients in real-time using Socket.IO, and provides APIs for data retrieval. A **React-based frontend** is included to display and visualize collision data in real time.

### Features:
1. **ESP32 Sensor Integration:**
   - Detects acceleration, gyroscopic changes, and temperature using the MPU6050.
   - Monitors impact levels using the YL-99 sensor.
   - Hardcoded GPS coordinates simulate real-time location data.

2. **Backend Integration:**
   - A Node.js server stores collision data in a MongoDB database.
   - Provides APIs for recording and fetching collision data.
   - Notifies connected clients of new collision events using Socket.IO.

3. **Frontend Integration:**
   - Displays real-time collision data using a React app.

4. **Real-time Updates:**
   - The backend broadcasts new collision data to all connected clients in real-time.

---

## How It Works

1. **Collision Detection:**
   - The ESP32 continuously monitors sensor data (acceleration, temperature, impact).
   - A collision is detected when predefined thresholds are crossed (e.g., acceleration > 14 m/s², temperature > 35°C, or an impact is detected) threshold values can be changed accordingly.

2. **Data Transmission:**
   - When a collision is detected, the ESP32 formats the data as a JSON object and sends it to the backend API using HTTP.

3. **Data Storage:**
   - The backend stores the collision data in a MongoDB database, ensuring it is timestamped for historical analysis.

4. **Real-time Notifications:**
   - The backend continuously monitors new collision events and uses Socket.IO to broadcast updates to connected clients.

5. **Frontend Visualization:**
   - The React frontend fetches collision data from the backend and displays it in a user-friendly dashboard, updating in real-time.

---

## Prerequisites

### Hardware Requirements:
- ESP32 Development Board
- MPU6050 Accelerometer and Gyroscope
- YL-99 Impact Sensor
- Breadboard and Connecting Wires
- WiFi Access Point for ESP32

### Software Requirements:
- Node.js (v14+ recommended)
- MongoDB
- Ngrok (for exposing the local server to the internet)
- React (included in the `frontend` folder)
- ESP32 Arduino Core (installed via Arduino IDE or PlatformIO)

---

## Project Setup

### Step 1: Clone the Repository
Clone the project repository to your local machine:
```bash
git clone <repository-url>
cd <repository-folder>
```

---

### Step 2: Configure the Backend

1. **Install Dependencies:**
   Navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```

2. **Set Up Environment Variables:**
   Create a `.env` file in the project root with the following content:
   ```env
   MONGODB_URI=mongodb://localhost:27017/collision_detection
   NODE_ENV=development
   ```

3. **Start the Server:**
   Start the backend server:
   ```bash
   npm run dev
   ```
   You should see messages confirming the server and MongoDB connection:
   ```
   Connected to MongoDB
   Server listening on port 3000
   ```

---

### Step 3: Set Up the Frontend

1. **Install Dependencies:**
   Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend:**
   Run the following command to start the React app:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

---

### Step 4: Expose the Backend Using Ngrok

1. **Install Ngrok:**
   Install Ngrok if not already installed:
   ```bash
   npm install -g ngrok
   ```

2. **Start Ngrok:**
   Expose the backend server to the internet:
   ```bash
   ngrok http 3000
   ```
   Copy the generated public URL (e.g., `https://xyz.ngrok.io`) for use in the ESP32 code.

---

### Step 5: Configure the ESP32 Code

1. **Update WiFi Credentials:**
   Replace the placeholders in the ESP32 code with your WiFi SSID and password:
   ```cpp
   const char* ssid = "Your wifi username";
   const char* password = "Your wifi password";
   ```

2. **Set the Server URL:**
   Update the `serverUrl` variable with the Ngrok URL:
   ```cpp
   const char* serverUrl = "https://xyz.ngrok.io/api/collisions";
   ```

3. **Upload the Code to ESP32:**
   Compile and upload the ESP32 code using the Arduino IDE or PlatformIO.

---

### Step 6: Monitor the System

1. **ESP32 Serial Monitor:**
   Open the serial monitor on your IDE to view sensor readings and HTTP response logs.

2. **Frontend Dashboard:**
   Open the React app in your browser (`http://localhost:5173`) to visualize collision data in real-time.

---

## API Endpoints

### POST `/api/collisions`
- **Description:** Stores collision data sent by the ESP32.
- **Request Body:**
  ```json
  {
    "impact": "High",
    "temperature": 37,
    "orientation": "Tilted",
    "location": { "lat": "12.9716", "long": "77.5946" }
  }
  ```
- **Response:**
  ```json
  {
    "message": "Collision data saved successfully!"
  }
  ```

### WebSocket `/`
- **Description:** Broadcasts real-time collision data to connected clients.
- **Event:** `newCollisionData`
- **Payload:**
  ```json
  [
    {
      "impact": "High",
      "temperature": 37,
      "orientation": "Tilted",
      "location": { "lat": "12.9716", "long": "77.5946" },
      "createdAt": "2024-11-16T12:34:56.789Z"
    }
  ]
  ```

---

## Future Enhancements

1. **GPS Integration:**
   - Use a GPS module with the ESP32 for dynamic location tracking.

2. **Enhanced Frontend:**
   - Add charts, filters, and search functionality to the React dashboard.

3. **Alert System:**
   - Integrate SMS or email notifications for critical collisions.

---

This project demonstrates a fully integrated IoT solution with sensor data acquisition, real-time data processing, and interactive visualization. 🚀