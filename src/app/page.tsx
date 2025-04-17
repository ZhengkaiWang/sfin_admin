'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 粒子效果组件
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布大小
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // 粒子类
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 4 + 2; // 增加粒子大小
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        
        // 随机选择颜色：蓝色、紫色或青色
        const colors = [
          `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.5})`, // 亮蓝色/紫色
          `rgba(129, 140, 248, ${Math.random() * 0.5 + 0.5})`, // 亮紫色
          `rgba(56, 189, 248, ${Math.random() * 0.5 + 0.5})`, // 亮青色
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 创建粒子数组
    const particleCount = 150; // 增加粒子数量
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // 绘制粒子和连线
    const animate = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      
      // 添加渐变背景效果
      const gradient = ctx.createLinearGradient(0, 0, canvas!.width, canvas!.height);
      gradient.addColorStop(0, 'rgba(30, 41, 59, 0.2)'); // slate-800 with low opacity
      gradient.addColorStop(1, 'rgba(49, 46, 129, 0.2)'); // indigo-900 with low opacity
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      
      // 更新和绘制粒子
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // 绘制粒子之间的连线
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) { // 增加连线距离
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.8 - distance / 150})`; // 更亮的颜色和更高的基础透明度
            ctx.lineWidth = 0.8; // 增加线宽
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};

// 打字效果组件
const TypewriterText = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);
  
  return <span>{displayText}<span className="animate-pulse">|</span></span>;
};

// 主页组件
export default function Home() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // 延迟显示内容和按钮
    const contentTimeout = setTimeout(() => {
      setShowContent(true);
    }, 500);
    
    const buttonTimeout = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    
    return () => {
      clearTimeout(contentTimeout);
      clearTimeout(buttonTimeout);
    };
  }, []);
  
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-indigo-900 text-white overflow-hidden">
      {/* 粒子背景 */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>
      
      {/* 主要内容 */}
      <div className="flex-grow flex items-center justify-center">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className={`transition-all duration-1000 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              SFIN
            </h1>
            
            <div className="text-xl md:text-2xl font-light mb-8 h-24 flex items-center justify-center">
              {showContent && (
                <TypewriterText text="SuperFinancial MCP服务器 - 为AI提供高质量金融数据" />
              )}
            </div>
            
            <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
              通过SFIN，您可以轻松获取股票、指数的市场数据和估值数据，以及宏观经济指标数据。
            </p>
            
            <div className={`transition-all duration-1000 ${showButton ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link 
                  href="/guide" 
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  了解更多
                </Link>
                <Link 
                  href="/apply" 
                  className="px-8 py-4 bg-transparent border-2 border-indigo-400 hover:bg-indigo-400/20 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  申请API令牌
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 特性卡片 */}
      <div className="relative z-10 w-full bg-black/30 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-blue-400 text-2xl font-bold mb-2">实时数据</div>
              <p className="text-blue-100">获取最新的股票、指数和宏观经济数据，支持多种指标和时间范围。</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-blue-400 text-2xl font-bold mb-2">简单集成</div>
              <p className="text-blue-100">通过MCP协议轻松集成到Claude等AI助手中，无需复杂的API调用。</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="text-blue-400 text-2xl font-bold mb-2">高性能</div>
              <p className="text-blue-100">基于SSE的流式响应，支持大量数据传输，响应迅速。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
