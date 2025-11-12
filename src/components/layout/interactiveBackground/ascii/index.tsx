import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import ASCIIEffect from "./asciiEffect";
import AsciiBlurLoading from "@/assets/interactiveBackground/blurred-ascii-compressed.png";
import BackgroundLoader from "../backgroundLoader";

export default function Ascii3DLily() {
  const [initialized, setInitialized] = useState(false);

  const threeRef = useRef<HTMLDivElement>(null); // DOM 요소 참조

  useEffect(() => {
    if (threeRef.current && typeof window !== "undefined") {
      // 1. Renderer 만들기 (화가)
      const renderer = new THREE.WebGLRenderer();

      // 2. Scene 만들기 (3D공간)
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff); // 흰색 배경

      // 3. Camera 만들기 (관객 시점)
      // OrthographicCamera: 도면 카메라
      // PerspectiveCamera: 원근 카메라 (실제 현실 카메라)
      const camera = new THREE.PerspectiveCamera(
        50, // 시야각 (FOV), 클수록 광각, 작을수록 망원
        window.innerWidth / window.innerHeight, // 화면 비율 (가로/세로)
        0.1, // Near Plane (이것보다 가까이 있으면 안 보임)
        1000, // Far Plane (먼 거리)
      );

      // 4. 카메라 위치 조정
      camera.position.z = 10; // 카메라를 뒤로 5만큼 빼기

      const asciiEffect = new ASCIIEffect(renderer);
      threeRef.current.appendChild(asciiEffect.domElement);

      // --------------- 리사이징 핸들러 ---------------
      let resizeTimeout: NodeJS.Timeout;

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // 1. 카메라 종횡비 업데이트
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          // 2. 렌더러 크기 업데이트
          renderer.setSize(window.innerWidth, window.innerHeight);

          // 3. ASCIIEffect 크기 업데이트
          asciiEffect.setSize(window.innerWidth, window.innerHeight);
        }, 100);
      };

      // 초기 크기 설정
      handleResize();

      // 리사이즈 이벤트 리스너 추가
      window.addEventListener("resize", handleResize);

      // ---------------------------------------------

      const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
      directionalLight.position.set(5, 15, 10);
      const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.3);

      scene.add(ambientLight);
      scene.add(directionalLight);
      scene.add(hemiLight);

      let lily: THREE.Group | null = null;

      const loader = new GLTFLoader();
      loader.load(
        "/models/lily.glb",
        (gltf) => {
          setInitialized(true);
          lily = gltf.scene;
          lily.position.set(1.5, 0, 0); // 위치 조절
          lily.scale.set(6, 6, 6);
          scene.add(lily);
        },
        undefined,
        (error) => {
          console.error("모델 로드 실패:", error);
        },
      );

      // OrbitControls 추가
      const controls = new OrbitControls(camera, asciiEffect.domElement);

      // 설정 (선택사항)
      controls.enableDamping = true; // 부드러운 감속
      controls.dampingFactor = 0.05; // 감속 정도
      controls.enableZoom = false; // 줌 허용
      controls.enableRotate = true; // 회전 허용
      controls.enablePan = false; // 패닝 허용

      let animationId: number;

      // 애니메이션 루프에서 업데이트 필요
      function animate() {
        if (lily) {
          lily.rotation.y += 0.0025;
        }
        controls.update();
        asciiEffect.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      }
      animate();

      return () => {
        // 1. 애니메이션 중지
        if (animationId) {
          cancelAnimationFrame(animationId);
        }

        // 2. Controls 해제
        controls.dispose();

        // 3. Renderer 해제
        renderer.dispose();

        // 4 이벤트 리스너 해제
        window.removeEventListener("resize", handleResize);

        // 5. 디바운스 타이머 해제
        clearTimeout(resizeTimeout);

        // 6. ASCIIEffect 해제
        if (asciiEffect.domElement.parentNode) {
          asciiEffect.domElement.parentNode.removeChild(asciiEffect.domElement);
        }

        // 5. Scene 정리
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            }
          }
        });
        scene.clear();
      };
    }
  }, []);

  return (
    <div className="fixed left-0 top-0 h-screen w-screen">
      <div
        ref={threeRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Img */}
      {!initialized && (
        <>
          <div
            className="absolute inset-0 m-auto flex h-screen w-screen items-center justify-center opacity-80"
            style={{
              backgroundImage: `url(${AsciiBlurLoading.src})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(20px)",
            }}
          />
          <BackgroundLoader />
        </>
      )}
    </div>
  );
}
