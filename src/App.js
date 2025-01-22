import { useEffect, useRef, useState } from 'react';
import './App.css';
import './styles.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from 'gsap';

const App = () => {
  const modelRef = useRef(null); // Реф для модели
  const containerRef = useRef(null); // Реф для контейнера
  const textRef = useRef(null); // Реф для текста
  const [scrollProgress, setScrollProgress] = useState(0); // Прогресс прокрутки

  useEffect(() => {
    // === СЦЕНА ===
    const scene = new THREE.Scene();

    // Камера
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Рендерер
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Устанавливаем цвет фона белым
    renderer.setClearColor(0xffffff, 1);

    // Освещение
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    // === ЗАГРУЗКА 3D-МОДЕЛИ ===
    const loader = new GLTFLoader();
    loader.load(
      '/model/porsche.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.8, 1.8, 1.8);
        model.position.set(2, -0.6, 0);
        scene.add(model);
        modelRef.current = model; // Сохраняем ссылку на модель
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Анимация сцены
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Очистка рендерера
    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // === Обработчик прокрутки колеса мыши ===
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleWheel = (e) => {
    // Определяем прокрутку в вертикальном направлении
    const delta = e.deltaY;

    // Увеличиваем или уменьшаем прогресс в зависимости от прокрутки
    setScrollProgress((prevProgress) => {
      let newProgress = prevProgress + delta * 0.002; // 0.002 - это скорость анимации
      newProgress = Math.max(0, Math.min(newProgress, 1)); // Ограничиваем прогресс от 0 до 1
      return newProgress;
    });

    if (modelRef.current) {
      // Плавное изменение позиции, вращения и масштаба
      gsap.to(modelRef.current.position, {
        x: 2 - scrollProgress * 5.5, // Переход от 1.5 к -1.5
        y: -0.6 + scrollProgress * 0.1, 
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(modelRef.current.rotation, {
        x: scrollProgress * 0.125, // Переход от 0 к +0.3
        y: -scrollProgress * 1.4, // Переход от 0 к -1.6
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(modelRef.current.scale, {
        x: 1.8 - scrollProgress * 0.25, // Переход от 1.8 к 1
        y: 1.8 - scrollProgress * 0.25,
        z: 1.8 - scrollProgress * 0.25,
        duration: 0.5,
        ease: 'power2.out',
      });
      
    }
    if (textRef.current && scrollProgress > 0.2) {
      gsap.to(textRef.current, {
        opacity: 1,
        y: 0,
        x: 0, // Текст перемещается в центр
        duration: 0,
        ease: 'power2.out',
      });
    }
    // Анимация скрытия текста при прокрутке вниз
    if (textRef.current) {
      if (scrollProgress < 0.8) {
        gsap.to(textRef.current, {
          opacity: 0,
          x: +300, // Текст уходит налево
          duration: 0.9,
          ease: 'power2.out',
        });
      }
    }
  };

  useEffect(() => {
    // Добавляем слушатель на колесо мыши
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, scrollProgress]);

  return (
    <div ref={containerRef} className="container">
      <h1 className="title">Porsche 911</h1>
      <h3
        ref={textRef}
        className="info-text"
        style={{ opacity: 0,  position: 'absolute', top: '40%', left: '55%' }}
      >
        Идея 911 Turbo. Наши инженеры стремятся создавать совершенные, но при этом комфортабельные и практичные спорткары.
        Модели 911 Turbo полностью соответствуют этому подходу.
      </h3>
    </div>
  );
};

export default App;
