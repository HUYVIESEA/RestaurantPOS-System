package com.example.restaurantpos.restaurantpo.mymap;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity implements OnMapReadyCallback {

    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;
    private GoogleMap mMap;
    private FusedLocationProviderClient fusedLocationClient;
    private List<LatLng> markerPositions = new ArrayList<>();
    private List<Marker> markers = new ArrayList<>();
    private List<Polyline> polylines = new ArrayList<>();

    private Button btnGetLocation, btnAddMarker, btnDrawRoute, btnClear;
    private TextView tvInfo;
    private LatLng currentLocation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Initialize UI elements
        btnGetLocation = findViewById(R.id.btnGetLocation);
        btnAddMarker = findViewById(R.id.btnAddMarker);
        btnDrawRoute = findViewById(R.id.btnDrawRoute);
        btnClear = findViewById(R.id.btnClear);
        tvInfo = findViewById(R.id.tvInfo);

        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Initialize map
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        setupButtonListeners();
    }

    private void setupButtonListeners() {
        btnGetLocation.setOnClickListener(v -> getCurrentLocation());

        btnAddMarker.setOnClickListener(v -> {
            if (currentLocation != null) {
                addMarker(currentLocation, "Điểm " + (markerPositions.size() + 1));
                Toast.makeText(this, "Đã thêm điểm tại vị trí hiện tại", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Vui lòng lấy vị trí hiện tại trước", Toast.LENGTH_SHORT).show();
            }
        });

        btnDrawRoute.setOnClickListener(v -> {
            if (markerPositions.size() >= 2) {
                drawRoute();
            } else {
                Toast.makeText(this, "Cần ít nhất 2 điểm để vẽ đường", Toast.LENGTH_SHORT).show();
            }
        });

        btnClear.setOnClickListener(v -> clearAll());
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;

        // Set default location (Vietnam)
        LatLng vietnam = new LatLng(10.8231, 106.6297); // Ho Chi Minh City
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(vietnam, 12));

        // Enable zoom controls
        mMap.getUiSettings().setZoomControlsEnabled(true);
        mMap.getUiSettings().setCompassEnabled(true);

        // Set map click listener to add markers
        mMap.setOnMapClickListener(latLng -> {
            addMarker(latLng, "Điểm " + (markerPositions.size() + 1));
            updateInfo();
        });

        // Request location permission
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            enableMyLocation();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST_CODE);
        }
    }

    private void getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    LOCATION_PERMISSION_REQUEST_CODE);
            return;
        }

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(this, location -> {
                    if (location != null) {
                        currentLocation = new LatLng(location.getLatitude(), location.getLongitude());
                        mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(currentLocation, 15));

                        String info = String.format(Locale.getDefault(),
                                "Vị trí: %.6f, %.6f",
                                location.getLatitude(),
                                location.getLongitude());
                        tvInfo.setText(info);
                        Toast.makeText(this, "Đã lấy vị trí hiện tại", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(this, "Không thể lấy vị trí. Vui lòng bật GPS", Toast.LENGTH_SHORT).show();
                    }
                })
                .addOnFailureListener(e -> {
                    Toast.makeText(this, "Lỗi: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
    }

    private void addMarker(LatLng position, String title) {
        if (mMap == null) return;

        MarkerOptions markerOptions = new MarkerOptions()
                .position(position)
                .title(title)
                .snippet(String.format(Locale.getDefault(), "%.6f, %.6f",
                        position.latitude, position.longitude));

        // Change marker color based on count
        float hue = (markerPositions.size() * 60) % 360;
        markerOptions.icon(BitmapDescriptorFactory.defaultMarker(hue));

        Marker marker = mMap.addMarker(markerOptions);
        if (marker != null) {
            marker.showInfoWindow();
            markers.add(marker);
        }
        markerPositions.add(position);
        updateInfo();
    }

    private void drawRoute() {
        if (markerPositions.size() < 2) return;

        // Clear existing polylines
        for (Polyline polyline : polylines) {
            polyline.remove();
        }
        polylines.clear();

        // Draw polyline connecting all markers
        PolylineOptions polylineOptions = new PolylineOptions()
                .addAll(markerPositions)
                .width(10)
                .color(Color.BLUE)
                .geodesic(true);

        Polyline polyline = mMap.addPolyline(polylineOptions);
        polylines.add(polyline);

        // Calculate total distance
        float totalDistance = 0;
        for (int i = 0; i < markerPositions.size() - 1; i++) {
            LatLng start = markerPositions.get(i);
            LatLng end = markerPositions.get(i + 1);

            float[] results = new float[1];
            Location.distanceBetween(
                    start.latitude, start.longitude,
                    end.latitude, end.longitude,
                    results
            );
            totalDistance += results[0];
        }

        String distanceInfo = String.format(Locale.getDefault(),
                "Tổng khoảng cách: %.2f km (%d điểm)",
                totalDistance / 1000, markerPositions.size());
        tvInfo.setText(distanceInfo);
        Toast.makeText(this, distanceInfo, Toast.LENGTH_LONG).show();
    }

    private void clearAll() {
        // Remove all markers
        for (Marker marker : markers) {
            marker.remove();
        }
        markers.clear();
        markerPositions.clear();

        // Remove all polylines
        for (Polyline polyline : polylines) {
            polyline.remove();
        }
        polylines.clear();

        tvInfo.setText("Đã xóa tất cả. Chạm vào bản đồ để thêm điểm");
        Toast.makeText(this, "Đã xóa tất cả", Toast.LENGTH_SHORT).show();
    }

    private void updateInfo() {
        if (markerPositions.isEmpty()) {
            tvInfo.setText("Chạm vào bản đồ để thêm điểm");
        } else {
            tvInfo.setText(String.format(Locale.getDefault(),
                    "Đã thêm %d điểm. Nhấn 'Vẽ đường' để xem khoảng cách",
                    markerPositions.size()));
        }
    }

    private void enableMyLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            mMap.setMyLocationEnabled(true);
            mMap.getUiSettings().setMyLocationButtonEnabled(true);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                enableMyLocation();
                getCurrentLocation();
            } else {
                Toast.makeText(this, "Cần quyền truy cập vị trí để sử dụng tính năng này",
                        Toast.LENGTH_LONG).show();
            }
        }
    }
}