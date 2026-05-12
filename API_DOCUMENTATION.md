# API Documentation

The backend (`server/index.cjs`) is an Express application that serves as an API gateway to the Google Gemini AI models.

## `POST /api/classify`
Analyzes an image of clothing and returns structured metadata.

**Request Body:**
```json
{
  "image": "data:image/webp;base64,UklGRiQAAABXRUJ..."
}
```
- `image`: Must be a valid Base64 Data URI string. Max payload size is ~15MB.

**Response:**
```json
{
  "category": "T-shirt",
  "color_palette": ["black", "white"],
  "formality_score": 3,
  "season": "Summer",
  "vibe": "Casual Streetwear"
}
```

## `POST /api/suggest`
Generates an outfit suggestion based on the user's available closet.

**Request Body:**
```json
{
  "closet": [
    { "id": "1", "category": "Jeans", "colorPalette": ["blue"], "isDirty": false },
    { "id": "2", "category": "T-shirt", "colorPalette": ["white"], "isDirty": false }
  ],
  "scene": "A Coffee Date",
  "rejectedIds": ["3", "4"]
}
```
- `closet`: An array of `ClosetItem` objects.
- `scene`: The text context for the outfit.
- `rejectedIds`: Optional array of item IDs the Stylist Engine should avoid using.

**Response:**
```json
{
  "topId": "2",
  "bottomId": "1",
  "footwearId": "5",
  "stylistNote": "The white t-shirt and blue jeans offer a classic, relaxed look perfect for a casual coffee date."
}
```

## `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-12T10:00:00Z"
}
```
