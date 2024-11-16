#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

// Include libraries for WiFi and HTTPClient (if using WiFi)
#include <WiFi.h>
#include <HTTPClient.h>

Adafruit_MPU6050 mpu;

// Define WiFi credentials
const char* ssid = "Your wifi username";
const char* password = "Your wifi password";

// Server URL for sending collision data
const char* serverUrl = "Post api url which is created using ngrok in this project"; // Replace with your server's endpoint

// Define pin for the YL-99 impact sensor
const int impactSensorPin = 16; // Replace D16 with the correct pin number based on your setup

void setup(void) {
  Serial.begin(115200);
  while (!Serial) delay(10); // Wait until serial console opens
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");

  Serial.println("Adafruit MPU6050 test!");

  // Initialize YL-99 impact sensor pin
  pinMode(impactSensorPin, INPUT);

  // Try to initialize the MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  delay(100);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Acceleration X: ");
  Serial.print(a.acceleration.x);
  Serial.print(", Y: ");
  Serial.print(a.acceleration.y);
  Serial.print(", Z: ");
  Serial.print(a.acceleration.z);
  Serial.println(" m/s^2");

  Serial.print("Rotation X: ");
  Serial.print(g.gyro.x);
  Serial.print(", Y: ");
  Serial.print(g.gyro.y);
  Serial.print(", Z: ");
  Serial.print(g.gyro.z);
  Serial.println(" rad/s");

  Serial.print("Temperature: ");
  Serial.print(temp.temperature);
  Serial.println(" degC");

  bool detection = false;
  int impactSensorValue = digitalRead(impactSensorPin); // Read the impact sensor

  char* impactLevel = "Low";
  char* orientation = "Upright";
  double acc = a.acceleration.z;

  if(a.acceleration.z > 14 || temp.temperature > 35){
    detection = true;
  }

  if (g.gyro.x > 2 || g.gyro.x < -2 || g.gyro.y > 2 || g.gyro.y < -2) {
    detection = true;
    orientation = "Tilted";
  }

  if(impactSensorValue == 0){
    detection = true;
    impactLevel = "High";
  }

  if (detection) {
    Serial.println("Accident Detected!");

    // Create the collision message in JSON format
    String jsonMessage = "{";
    jsonMessage += "\"impact\": \"" + String(impactLevel) + "\",";
    jsonMessage += "\"temperature\": " + String(temp.temperature) + ",";
    jsonMessage += "\"orientation\": \"" + String(orientation) + "\",";
    jsonMessage += "\"acceleration\": \"" + String(acc) + "\",";
    jsonMessage += "\"location\": {\"lat\": \"12.9716\", \"long\": \"77.5946\"}";
    jsonMessage += "}";

    Serial.println("Sending message: " + jsonMessage);

    // Check if WiFi is connected before sending
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonMessage);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Response code: " + String(httpResponseCode));
        Serial.println("Response: " + response);
      } else {
        Serial.print("Error on sending: ");
        Serial.println(httpResponseCode);
      }
      http.end(); // Free resources
    } else {
      Serial.println("WiFi not connected!");
    }

    delay(2000); // Delay before next detection
  }

  Serial.println("");
  delay(500);
}
