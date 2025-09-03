// App.jsx
import { useEffect, useRef, useState } from 'react';
import './styles.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

let App;

App = () => {
  const modelRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const textRef2 = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xeeeeee, 1);
    containerRef.current.appendChild(renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5).normalize();
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040, 1.5));

    const loader = new GLTFLoader();
    loader.load(
      '/model/porsche.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.8, 1.8, 1.8);
        model.position.set(2, -0.6, 0);
        scene.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;

    const animateScene = () => {
      requestAnimationFrame(animateScene);
      controls.update();
      renderer.render(scene, camera);
    };
    animateScene();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleWheel = (e) => {
    const delta = e.deltaY;
    const newProgress = Math.max(0, Math.min(scrollProgress + delta * 0.002, 1.5));
    setScrollProgress(newProgress);

    if (modelRef.current) {
      // Фаза 1: перемещение и лёгкий поворот
      if (newProgress <= 1) {
        gsap.to(modelRef.current.position, {
          x: 2 - newProgress * 5.5,
          y: -0.6 + newProgress * 0.1,
          duration: 0.5, ease: 'power2.out',
        });
        gsap.to(modelRef.current.rotation, {
          y: -newProgress * Math.PI / 2, // плавный поворот на 90°
          duration: 0.5, ease: 'power2.out',
        });
        gsap.to(modelRef.current.scale, {
          x: 1.8 - newProgress * 0.25,
          y: 1.8 - newProgress * 0.25,
          z: 1.8 - newProgress * 0.25,
          duration: 0.5, ease: 'power2.out',
        });
      }
      // Фаза 2: разворот к зрителю
      if (newProgress > 1) {
        gsap.to(modelRef.current.position, {
          x: -1,
          y: -0.85,
          z: 0,
          duration: 0.5, ease: 'power2.out',
        });
        gsap.to(modelRef.current.rotation, {
          x: newProgress * Math.PI * 0.22577 , // ровно лицом к зритеmлю

          duration: 0.8, ease: 'power2.out',
        });
        gsap.to(modelRef.current.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 0.5, ease: 'power2.out',
        });
      }
    }

    if (textRef.current) {
      if (newProgress > 0.2 && newProgress < 1) {
        gsap.to(textRef.current, { opacity: 1, y: 0, x: 0, duration: 0.5, ease: 'power2.out' });
      } else {
        gsap.to(textRef.current, { opacity: 0, x: 300, duration: 0.5, ease: 'power2.out' });
      }
    }
    if (textRef2.current) {
      if (newProgress > 1) {
        gsap.to(textRef2.current, { opacity: 1, y: 0, x: 0, duration: 0.5, ease: 'power2.out' });
      } else {
        gsap.to(textRef2.current, { opacity: 0, x: -300, duration: 0.5, ease: 'power2.out' });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollProgress]);

  return (
    <div ref={containerRef} className="container">
      <h1 className="title">Porsche 911</h1>
      <h3
        ref={textRef}
        className="info-text"
        style={{ opacity: 0, position: 'absolute', top: '40%', left: '55%' }}
      >
        Идея 911 Turbo. Наши инженеры стремятся создавать совершенные, но при этом
        комфортабельные и практичные спорткары. Модели 911 Turbo полностью соответствуют этому подходу.
      </h3>
      <h3
        ref={textRef2}
        className="info-text-second"
        style={{ opacity: 0, position: 'absolute', top: '40%', left: '5%' }}
      >
        Вид сверху демонстрирует аэродинамический силуэт автомобиля. 911 Turbo сочетает спортивный характер 
        с изысканными технологическими решениями, что обеспечивает превосходную управляемость и комфорт.
      </h3>
    </div>
  );
};

export default App;
