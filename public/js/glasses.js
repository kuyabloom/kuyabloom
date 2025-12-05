const canvas = document.getElementById("glasses-canvas");
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true,
	alpha: true,
});
// cap DPR for performance on very dense displays
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(35, 2, 0.1, 100);
camera.position.set(0, 0, 6);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// Create a simple eyeglasses model using torus frames + bridge + temples
const glasses = new THREE.Group();

const rimMaterial = new THREE.MeshStandardMaterial({
	color: 0x151515,
	metalness: 0.2,
	roughness: 0.3,
});

function createRim(x) {
	const geometry = new THREE.TorusGeometry(0.9, 0.12, 16, 60);
	const mesh = new THREE.Mesh(geometry, rimMaterial);
	mesh.position.x = x;
	mesh.rotation.y = Math.PI / 9;
	return mesh;
}

const leftRim = createRim(-1.05);
const rightRim = createRim(1.05);
glasses.add(leftRim, rightRim);

// Bridge
const bridgeGeo = new THREE.BoxGeometry(0.35, 0.12, 0.12);
const bridge = new THREE.Mesh(bridgeGeo, rimMaterial);
bridge.position.set(0, 0, 0.05);
glasses.add(bridge);

// Temples (side arms) — simple boxes angled back
const templeGeo = new THREE.BoxGeometry(1.6, 0.1, 0.08);
const leftTemple = new THREE.Mesh(templeGeo, rimMaterial);
leftTemple.position.set(-2.0, 0.03, -0.22);
leftTemple.rotation.z = 0.05;
leftTemple.rotation.y = 0.6;
const rightTemple = leftTemple.clone();
rightTemple.position.x = 2.0;
rightTemple.rotation.y = -0.6;
glasses.add(leftTemple, rightTemple);

glasses.scale.set(0.95, 0.95, 0.95);
scene.add(glasses);

// subtle chromatic-ish highlight using an outline-like rim (thin line)
const edgeMaterial = new THREE.MeshBasicMaterial({
	color: 0x9ad1ff,
	opacity: 0.06,
	transparent: true,
});
const leftEdge = createRim(-1.05);
const rightEdge = createRim(1.05);
leftEdge.material = edgeMaterial;
rightEdge.material = edgeMaterial;
leftEdge.scale.set(1.02, 1.02, 1.02);
rightEdge.scale.set(1.02, 1.02, 1.02);
glasses.add(leftEdge, rightEdge);

function resizeRendererToDisplaySize(renderer) {
	const canvas = renderer.domElement;
	const rect = canvas.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const width = Math.max(1, Math.floor(rect.width));
	const height = Math.max(1, Math.floor(rect.height));
	const needResize =
		canvas.width !== width * dpr || canvas.height !== height * dpr;
	if (needResize) {
		renderer.setPixelRatio(dpr);
		renderer.setSize(width, height, false);
	}
	return needResize;
}

// ensure initial sizing and update camera aspect accordingly
function fitCanvasAndCamera() {
	const rect = canvas.getBoundingClientRect();
	const aspect = rect.width / rect.height || 1;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	resizeRendererToDisplaySize(renderer);
}

let clock = new THREE.Clock();

function animate() {
	const t = clock.getElapsedTime();

	// gentle floating
	glasses.rotation.y = Math.sin(t * 0.6) * 0.25;
	glasses.rotation.x = Math.sin(t * 0.3) * 0.08;
	glasses.position.y = Math.sin(t * 0.8) * 0.08;

	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Make the scene interactive -> basic pointer rotate
let isPointerDown = false;
let lastX = 0;
canvas.addEventListener("pointerdown", (e) => {
	isPointerDown = true;
	lastX = e.clientX;
	canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointerup", (e) => {
	isPointerDown = false;
});
canvas.addEventListener("pointermove", (e) => {
	if (!isPointerDown) return;
	const dx = e.clientX - lastX;
	lastX = e.clientX;
	glasses.rotation.y += dx * 0.005;
});

// handle window resizes to keep the canvas fitting the container
window.addEventListener("resize", () => {
	fitCanvasAndCamera();
});

// initial fit
fitCanvasAndCamera();
