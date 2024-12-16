// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Flat Surface (Plane)
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Cube in the center
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0.5, 0);
cube.castShadow = true;
scene.add(cube);

// Main Light Controlled by Mouse (Theater Spotlight)
const mouseLight = new THREE.SpotLight(0xffffff, 6); // Bright and larger spotlight
mouseLight.castShadow = true;
mouseLight.angle = Math.PI / 6; // Wider cone angle for larger light
mouseLight.penumbra = 0.1; // Softer edges
mouseLight.distance = 30; // Light range
mouseLight.decay = 2; // Intensity falloff
mouseLight.position.set(0, 5, 0); // Default position
scene.add(mouseLight);

// Add a target for the SpotLight
const lightTarget = new THREE.Object3D();
lightTarget.position.set(0, 0, 0);
scene.add(lightTarget);
mouseLight.target = lightTarget;

// Raycaster to calculate mouse position on the plane
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener to track mouse movement
window.addEventListener("mousemove", (event) => {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cast a ray from the camera through the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersection with the plane
  const intersects = raycaster.intersectObject(plane);
  if (intersects.length > 0) {
    const point = intersects[0].point; // Get intersection point on the plane

    // Update the spotlight's position and target
    mouseLight.position.set(point.x, 5, point.z); // Keep the light 5 units above the plane
    lightTarget.position.set(point.x, 0, point.z); // Spotlight target is on the plane
  }
});

// Firefly Lights Configuration
const fireflyCount = 10; // Number of fireflies
const fireflies = [];
const colors = [0xff0000, 0x00ff00, 0x0000ff]; // Red, Green, Blue

// Create Fireflies
for (let i = 0; i < fireflyCount; i++) {
  const fireflyLight = new THREE.PointLight(
    colors[Math.floor(Math.random() * colors.length)],
    3,
    10
  );

  // Initial position
  fireflyLight.position.set(
    Math.random() * 20 - 10,
    Math.random() * 10 + 1,
    Math.random() * 20 - 10
  );

  // Tiny sphere for visualization
  const fireflySphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: fireflyLight.color })
  );
  fireflySphere.position.copy(fireflyLight.position);

  fireflies.push({
    light: fireflyLight,
    sphere: fireflySphere,
    direction: new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    ),
  });

  scene.add(fireflyLight);
  scene.add(fireflySphere);
}

// Animate Fireflies
function animateFireflies() {
  fireflies.forEach((firefly) => {
    firefly.light.position.add(firefly.direction);
    firefly.sphere.position.copy(firefly.light.position);

    // Bounce back at boundaries
    ["x", "y", "z"].forEach((axis) => {
      if (firefly.light.position[axis] > 10 || firefly.light.position[axis] < -10) {
        firefly.direction[axis] *= -1;
      }
    });
  });
}

// Camera Setup
camera.position.set(8, 6, 8);
camera.lookAt(0, 0, 0);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Animate fireflies
  animateFireflies();

  renderer.render(scene, camera);
}

animate();
