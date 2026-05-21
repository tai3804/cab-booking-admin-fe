# Pricing Admin API Documentation

## Ngữ cảnh hệ thống

### Vị trí trong kiến trúc microservice

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client    │────▶│  Pricing Service │────▶│   MongoDB    │
│  (Frontend) │     │   Port: 8088     │     │ pricing_db   │
└─────────────┘     └──────────────────┘     └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │     Redis        │
                    │  (Cache/Surge)   │
                    └──────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ Mapbox   │       │ OpenMeteo│       │  Auth    │
    │ Distance │       │ Weather  │       │ Service  │
    └──────────┘       └──────────┘       └──────────┘
```

### Luồng dữ liệu

1. **3 loại xe mặc định** được khởi tạo từ `application.yaml` vào MongoDB khi service start (`PricingDataInitializer`)
2. **Surge rules** được tạo/update bởi admin, lưu vào MongoDB + cache Redis
3. **Fare estimate** đọc từ PricingConfig (MongoDB) + SurgeRule (MongoDB/Redis)

---

## Authentication

Tất cả các Admin API yêu cầu JWT token có role `ADMIN`.

**Header:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Cách lấy token:**
1. Login qua Auth Service: `POST http://localhost:8081/auth/login`
2. Body: `{"email": "admin@example.com", "password": "12345678", ...}`
3. Lấy `result.accessToken` từ response

**Response wrapper chuẩn:**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

---

## 06 - Admin Pricing Config & Surge Management

Base URL: `http://localhost:8088/api/admin`

---

### 01 - Dashboard

#### `GET /api/admin/dashboard`

**Mục đích:** Lấy tổng quan toàn bộ hệ thống pricing (configs, surge rules, active zones).

**Response mẫu:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalPricingConfigs": 3,
    "totalSurgeRules": 4,
    "activeZones": 4,
    "configSummary": {
      "vehicleTypes": ["BIKE", "CAR4", "CAR7"]
    },
    "surgeSummary": {
      "zones": ["Z60206", "Z60207", "Z60208", "Z60209"],
      "multiplierRange": {
        "min": 1.1,
        "max": 1.8
      },
      "avgMultiplier": 1.4
    }
  }
}
```

**Trường trong `data`:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `totalPricingConfigs` | `int` | Tổng số PricingConfig trong DB |
| `totalSurgeRules` | `int` | Tổng số SurgeRule trong DB |
| `activeZones` | `int` | Số zone có metrics trong Redis |
| `configSummary` | `Map<String,Object>` | Tổng hợp vehicle types + range baseFare |
| `surgeSummary` | `Map<String,Object>` | Tổng hợp zones + range multiplier + avg |

---

### Pricing Config APIs

Collection: `pricing_configs` (MongoDB)

#### `POST /api/admin/pricing-configs`

**Mục đích:** Tạo mới một PricingConfig cho một loại xe. **Chỉ tạo được khi loại xe chưa tồn tại** (409 Conflict nếu trùng).

**Request body:**
```json
{
  "vehicleType": "BIKE",
  "baseFare": 10000,
  "perKmRate": 3500,
  "perMinuteRate": 200,
  "multiplier": 1.0,
  "active": true
}
```

**Validation:**
- `vehicleType`: bắt buộc, string (sẽ tự đổi thành UPPERCASE)
- `baseFare`: bắt buộc, > 0
- `perKmRate`: bắt buộc, > 0
- `perMinuteRate`: bắt buộc, > 0
- `multiplier`: optional, mặc định 1.0
- `active`: optional, mặc định true

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Pricing config created successfully",
  "data": {
    "id": "687a1b2c3d4e5f6a7b8c9d0e",
    "vehicleType": "BIKE",
    "baseFare": 10000,
    "perKmRate": 3500,
    "perMinuteRate": 200,
    "multiplier": 1.0,
    "active": true,
    "updatedAt": "2026-05-22T02:00:00",
    "schemaVersion": "1.0.0"
  }
}
```

**Các trường trong response:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `String` | MongoDB ObjectId |
| `vehicleType` | `String` | Loại xe (BIKE, CAR4, CAR7) |
| `baseFare` | `Double` | Giá cước cơ bản (VND) |
| `perKmRate` | `Double` | Phí theo km (VND) |
| `perMinuteRate` | `Double` | Phí theo phút (VND) |
| `multiplier` | `Double` | Hệ số nhân giá (surge multiplier base) |
| `active` | `Boolean` | Config có đang active không |
| `updatedAt` | `LocalDateTime` | Thời điểm cập nhật gần nhất |
| `schemaVersion` | `String` | Phiên bản schema |

**Lỗi:**
- `400 Bad Request`: Validation fail
- `409 Conflict`: VehicleType đã tồn tại
- `403 Forbidden`: Không có quyền ADMIN

---

#### `GET /api/admin/pricing-configs`

**Mục đích:** Lấy danh sách tất cả PricingConfig. Hỗ trợ filter theo `active`.

**Query params:**
- `active` (optional): `true` hoặc `false`

**Request:**
```
GET /api/admin/pricing-configs
GET /api/admin/pricing-configs?active=true
```

**Response 200:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "...",
      "vehicleType": "BIKE",
      "baseFare": 8000,
      "perKmRate": 3500,
      "perMinuteRate": 400,
      "multiplier": 1.0,
      "active": true,
      "updatedAt": "2026-05-22T02:00:00",
      "schemaVersion": "1.0.0"
    },
    {
      "id": "...",
      "vehicleType": "CAR4",
      "baseFare": 12000,
      "perKmRate": 8500,
      "perMinuteRate": 1200,
      "multiplier": 1.0,
      "active": true,
      "updatedAt": "2026-05-22T02:00:00",
      "schemaVersion": "1.0.0"
    },
    {
      "id": "...",
      "vehicleType": "CAR7",
      "baseFare": 20000,
      "perKmRate": 12000,
      "perMinuteRate": 1800,
      "multiplier": 1.5,
      "active": true,
      "updatedAt": "2026-05-22T02:00:00",
      "schemaVersion": "1.0.0"
    }
  ]
}
```

**Giá trị mặc định từ application.yaml:**

| vehicleType | baseFare | perKmRate | perMinuteRate | multiplier |
|---|---|---|---|---|
| BIKE | 8000 | 3500 | 400 | 1.0 |
| CAR4 | 12000 | 8500 | 1200 | 1.0 |
| CAR7 | 20000 | 12000 | 1800 | 1.5 |

> **Lưu ý:** 3 loại xe trên sẽ tự động được sync vào MongoDB khi service khởi động lần đầu (qua `PricingDataInitializer`).

---

#### `GET /api/admin/pricing-configs/{id}`

**Mục đích:** Lấy PricingConfig theo MongoDB ID.

**Request:**
```
GET /api/admin/pricing-configs/687a1b2c3d4e5f6a7b8c9d0e
```

**Response 200:** Trả về object `PricingConfigResponse` (cấu trúc như trên).

**Lỗi:** `404 Not Found` nếu ID không tồn tại.

---

#### `GET /api/admin/pricing-configs/vehicle/{vehicleType}`

**Mục đích:** Lấy PricingConfig theo loại xe.

**Request:**
```
GET /api/admin/pricing-configs/vehicle/BIKE
```

**Response 200:** Trả về object `PricingConfigResponse`.

**Lỗi:** `404 Not Found` nếu vehicleType không tồn tại.

---

#### `PUT /api/admin/pricing-configs/{id}`

**Mục đích:** Cập nhật toàn bộ PricingConfig.

**Request body:** (tương tự POST)
```json
{
  "vehicleType": "BIKE",
  "baseFare": 12000,
  "perKmRate": 4000,
  "perMinuteRate": 250,
  "multiplier": 1.0,
  "active": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Pricing config updated successfully",
  "data": {
    "id": "687a1b2c3d4e5f6a7b8c9d0e",
    "vehicleType": "BIKE",
    "baseFare": 12000,
    "perKmRate": 4000,
    "perMinuteRate": 250,
    "multiplier": 1.0,
    "active": true,
    "updatedAt": "2026-05-22T02:05:00",
    "schemaVersion": "1.0.0"
  }
}
```

**Lưu ý:** `updatedAt` sẽ được cập nhật thành thời điểm hiện tại.

---

#### `PATCH /api/admin/pricing-configs/{id}/toggle`

**Mục đích:** Toggle trạng thái active/inactive của một PricingConfig.

**Request:**
```
PATCH /api/admin/pricing-configs/687a1b2c3d4e5f6a7b8c9d0e/toggle
```

**Response 200:** Trả về `PricingConfigResponse` với `active` đã bị đảo ngược.

---

#### `DELETE /api/admin/pricing-configs/{id}`

**Mục đích:** Xóa một PricingConfig.

**Request:**
```
DELETE /api/admin/pricing-configs/687a1b2c3d4e5f6a7b8c9d0e
```

**Response 200:**
```json
{
  "success": true,
  "message": "Pricing config deleted successfully",
  "data": null
}
```

**Lỗi:** `404 Not Found` nếu ID không tồn tại.

---

### Surge Rule APIs

Collection: `surge_rules` (MongoDB) + Redis cache

#### `POST /api/admin/surge-rules`

**Mục đích:** Tạo surge rule cho một zone. **Chỉ tạo được khi zone chưa có rule** (409 Conflict nếu trùng).

**Request body:**
```json
{
  "zoneId": "Z60206",
  "zoneName": "District 1 Downtown",
  "surgeMultiplier": 1.5,
  "latitude": 10.8231,
  "longitude": 106.6297,
  "radiusKm": 2.0,
  "activeDrivers": 20,
  "pendingRides": 50,
  "minMultiplier": 1.0,
  "maxMultiplier": 3.0,
  "source": "MANUAL"
}
```

**Validation:**
- `zoneId`: bắt buộc, unique
- `surgeMultiplier`: bắt buộc, giá trị từ 1.0 - 3.0 (sẽ bị clamp)
- `latitude`, `longitude`, `radiusKm`: optional, thông tin địa lý
- `activeDrivers`, `pendingRides`: optional, metrics hiện tại
- `source`: optional, mặc định "MANUAL"

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Surge rule created successfully",
  "data": {
    "id": "687a1b2c3d4e5f6a7b8c9d1f",
    "zoneId": "Z60206",
    "zoneName": "District 1 Downtown",
    "surgeMultiplier": 1.50,
    "latitude": 10.8231,
    "longitude": 106.6297,
    "radiusKm": 2.0,
    "activeDrivers": 20,
    "pendingRides": 50,
    "demandScore": null,
    "minMultiplier": 1.0,
    "maxMultiplier": 3.0,
    "lastUpdated": "2026-05-22T02:00:00",
    "createdAt": "2026-05-22T02:00:00",
    "source": "MANUAL",
    "schemaVersion": "1.0.0"
  }
}
```

**Trường trong response:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `String` | MongoDB ObjectId |
| `zoneId` | `String` | Mã zone (unique) |
| `zoneName` | `String` | Tên zone |
| `surgeMultiplier` | `BigDecimal` | Hệ số surge (1.0 - 3.0) |
| `latitude` | `Double` | Vĩ độ tâm zone |
| `longitude` | `Double` | Kinh độ tâm zone |
| `radiusKm` | `Double` | Bán kính zone (km) |
| `activeDrivers` | `Integer` | Số driver đang hoạt động |
| `pendingRides` | `Integer` | Số ride đang chờ |
| `demandScore` | `Double` | Điểm demand (null nếu chưa tính) |
| `minMultiplier` | `BigDecimal` | Giới hạn tối thiểu |
| `maxMultiplier` | `BigDecimal` | Giới hạn tối đa |
| `lastUpdated` | `LocalDateTime` | Thời điểm cập nhật gần nhất |
| `createdAt` | `LocalDateTime` | Thời điểm tạo |
| `source` | `String` | Nguồn: MANUAL hoặc AUTOMATIC |
| `schemaVersion` | `String` | Phiên bản schema |

---

#### `POST /api/admin/surge-rules/bulk`

**Mục đích:** Tạo nhiều surge rules cùng lúc.

**Request body:** Array các SurgeRuleRequest
```json
[
  {
    "zoneId": "Z60208",
    "zoneName": "District 5",
    "surgeMultiplier": 1.3,
    "latitude": 10.7456,
    "longitude": 106.6563,
    "source": "MANUAL"
  },
  {
    "zoneId": "Z60209",
    "zoneName": "District 10",
    "surgeMultiplier": 1.1,
    "latitude": 10.7654,
    "longitude": 106.6789,
    "source": "MANUAL"
  }
]
```

**Response 201:** Trả về array các `SurgeRuleResponse`.

---

#### `GET /api/admin/surge-rules`

**Mục đích:** Lấy danh sách tất cả surge rules.

**Response 200:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "...",
      "zoneId": "Z60206",
      "zoneName": "District 1 Downtown",
      "surgeMultiplier": 1.80,
      ...
    },
    {
      "id": "...",
      "zoneId": "Z60207",
      "zoneName": "District 3",
      "surgeMultiplier": 1.20,
      ...
    }
  ]
}
```

---

#### `GET /api/admin/surge-rules/{id}`

**Mục đích:** Lấy surge rule theo ID.

**Response 200:** Trả về `SurgeRuleResponse`.
**Lỗi:** `404 Not Found`.

---

#### `GET /api/admin/surge-rules/zone/{zoneId}`

**Mục đích:** Lấy surge rule theo zone ID.

**Request:**
```
GET /api/admin/surge-rules/zone/Z60206
```

**Response 200:** Trả về `SurgeRuleResponse`.
**Lỗi:** `404 Not Found`.

---

#### `PUT /api/admin/surge-rules/{id}`

**Mục đích:** Cập nhật surge rule. Hỗ trợ partial update (chỉ cần gửi các trường muốn thay đổi).

**Request body:**
```json
{
  "zoneId": "Z60206",
  "surgeMultiplier": 1.8,
  "activeDrivers": 30,
  "pendingRides": 80,
  "source": "MANUAL"
}
```

**Response 200:** Trả về `SurgeRuleResponse` đã cập nhật.

**Lưu ý:** Khi update surge rule, Redis cache cũng được cập nhật đồng thời.

---

#### `DELETE /api/admin/surge-rules/{id}`

**Mục đích:** Xóa surge rule theo ID.

**Response 200:** Xóa thành công + invalidate Redis cache.
**Lỗi:** `404 Not Found`.

---

#### `DELETE /api/admin/surge-rules/zone/{zoneId}`

**Mục đích:** Xóa surge rule theo zone ID (không cần biết ObjectId).

**Response 200:** Xóa thành công + invalidate Redis cache.

---

### Bulk Zone Metrics APIs

#### `POST /api/admin/zone-metrics/bulk`

**Mục đích:** Cập nhật demand/supply metrics cho nhiều zone cùng lúc. Dữ liệu được lưu vào Redis.

**Request body:**
```json
{
  "zoneMetrics": [
    {
      "zoneId": "Z60206",
      "activeDrivers": 25,
      "pendingRides": 60
    },
    {
      "zoneId": "Z60207",
      "activeDrivers": 15,
      "pendingRides": 40
    },
    {
      "zoneId": "Z60208",
      "activeDrivers": 10,
      "pendingRides": 30
    }
  ]
}
```

**Validation:**
- `zoneMetrics`: bắt buộc, không được rỗng
- `zoneId`: bắt buộc
- `activeDrivers`: bắt buộc, > 0
- `pendingRides`: bắt buộc, > 0

**Response 200:**
```json
{
  "success": true,
  "message": "Zone metrics updated successfully",
  "data": null
}
```

**Tác dụng:** Metrics được dùng bởi surge calculation engine để tự động tính surge multiplier cho mỗi zone.

---

## Luồng test trong Postman

### Thứ tự chạy đề xuất

**Folder 00 - Auth:**
1. Register/Login USER → lấy `JWT_TOKEN`
2. Register/Login DRIVER → lấy `DRIVER_JWT_TOKEN`
3. Login ADMIN → lấy `ADMIN_JWT_TOKEN`

**Folder 06 - Admin:**
1. `GET /dashboard` → xem tổng quan
2. `POST /pricing-configs` (BIKE) → tạo config
3. `POST /pricing-configs` (CAR4) → tạo config
4. `POST /pricing-configs` (CAR7) → tạo config
5. `GET /pricing-configs` → xác nhận 3 xe đã có
6. `GET /pricing-configs/vehicle/BIKE` → test query theo loại xe
7. `PUT /pricing-configs/{id}` → update base fare
8. `PATCH /pricing-configs/{id}/toggle` → toggle active
9. `POST /surge-rules` → tạo surge rule
10. `POST /surge-rules/bulk` → tạo nhiều surge rules
11. `GET /surge-rules` → xác nhận surge rules
12. `PUT /surge-rules/{id}` → update surge multiplier
13. `POST /zone-metrics/bulk` → cập nhật metrics
14. `DELETE /surge-rules/zone/{zoneId}` → xóa theo zone
15. `DELETE /surge-rules/{id}` → xóa theo ID
16. `DELETE /pricing-configs/{id}` → xóa config
17. `GET /dashboard` → xác nhận dữ liệu thay đổi

---

## Các lỗi thường gặp

| HTTP Code | Error Code | Nguyên nhân |
|---|---|---|
| 400 | VALIDATION_ERROR | Request body không hợp lệ |
| 403 | FORBIDDEN | Token không có quyền ADMIN |
| 404 | NOT_FOUND | ID hoặc zoneId không tồn tại |
| 409 | CONFLICT | VehicleType/zoneId đã tồn tại |
| 500 | INTERNAL_ERROR | Lỗi server |

---

## Mapping UI

### Bảng Pricing Config (danh sách xe)

```
┌─────────────────────────────────────────────────────────────┐
│  QUẢN LÝ GIÁ CƯỚC                                            │
├────────┬──────────┬──────────┬───────────┬────────┬─────────┤
│  Xe    │ Giá cơ bản│ /Km     │ /Phút     │ Hệ số  │ Trạng thái│
├────────┼──────────┼──────────┼───────────┼────────┼─────────┤
│  BIKE  │ 8,000đ   │ 3,500đ   │ 400đ      │ 1.0x   │ ● Active │
│  CAR4  │ 12,000đ  │ 8,500đ   │ 1,200đ    │ 1.0x   │ ● Active │
│  CAR7  │ 20,000đ  │ 12,000đ  │ 1,800đ    │ 1.5x   │ ● Active │
├────────┴──────────┴──────────┴───────────┴────────┴─────────┤
│  [+ Thêm loại xe]   [Chỉnh sửa]   [Xóa]                    │
└─────────────────────────────────────────────────────────────┘
```

### Bảng Surge Rules (theo zone)

```
┌──────────────────────────────────────────────────────────────────────┐
│  QUẢN LÝ SURGE RULES                                                 │
├────────┬───────────────────┬───────────┬─────────────┬────────────────┤
│  Zone  │ Tên Zone          │ Multiplier│ Source      │ Active Drivers │
├────────┼───────────────────┼───────────┼─────────────┼────────────────┤
│  Z60206│ District 1        │ 1.8x      │ MANUAL      │ 30             │
│  Z60208│ District 5        │ 1.3x      │ MANUAL      │ 10             │
│  Z60209│ District 10       │ 1.1x      │ MANUAL      │ 15             │
├────────┴───────────────────┴───────────┴─────────────┴────────────────┤
│  [+ Thêm Zone]   [Bulk Update]   [Xóa]                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Dashboard Summary

```
┌─────────────────────────────────────────────────────┐
│  TỔNG QUAN                                          │
│  ─────────────────────────────────────────────────── │
│  Loại xe đang active:     3                          │
│  Zone có surge rules:      4                          │
│  Zone đang hoạt động:     4                          │
│  ─────────────────────────────────────────────────── │
│  Surge Multiplier Range:  1.1x ~ 1.8x               │
│  Trung bình Multiplier:   1.4x                       │
└─────────────────────────────────────────────────────┘
```

---

## Nguồn dữ liệu

| Dữ liệu | Nguồn | Chi tiết |
|---|---|---|
| 3 loại xe mặc định | `application.yaml` | `pricing.vehicle.{bike,car4,car7}` |
| Surge multiplier | MongoDB + Redis | Ưu tiên Redis, fallback MongoDB |
| Fallback surge | `application.yaml` | `pricing.surge.defaultMultiplier` |
| Surge limits | `application.yaml` | `pricing.surge.minMultiplier`, `maxMultiplier` |
