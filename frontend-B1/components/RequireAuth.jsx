'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Camera, Lock, Shield } from 'lucide-react';

export default function RequireAuth({ children }) {
  const { loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login');
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-content">
          {/* Animated Logo */}
          <div className="logo-container">
            <div className="logo-ring ring-1"></div>
            <div className="logo-ring ring-2"></div>
            <div className="logo-ring ring-3"></div>
            <div className="logo-icon">
              <Camera size={48} strokeWidth={2} />
            </div>
          </div>

          {/* App Name */}
          <h1 className="app-name">Photonest</h1>

          {/* Loading Text */}
          <div className="loading-text">
            <Shield size={18} strokeWidth={2} className="shield-icon" />
            <span>Authenticating...</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          {/* Loading Dots */}
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        <style jsx>{`
          .auth-loading-screen {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
          }

          .auth-loading-screen::before {
            content: '';
            position: absolute;
            inset: 0;
            background: 
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
            animation: float 8s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-20px) scale(1.05);
            }
          }

          .loading-content {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.6s ease;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Logo Animation */
          .logo-container {
            position: relative;
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logo-ring {
            position: absolute;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .ring-1 {
            width: 120px;
            height: 120px;
            animation: pulse 2s ease-in-out infinite;
          }

          .ring-2 {
            width: 90px;
            height: 90px;
            animation: pulse 2s ease-in-out 0.3s infinite;
          }

          .ring-3 {
            width: 60px;
            height: 60px;
            animation: pulse 2s ease-in-out 0.6s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.5;
            }
          }

          .logo-icon {
            position: relative;
            z-index: 10;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            color: white;
            backdrop-filter: blur(10px);
            animation: rotate 3s linear infinite;
          }

          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* App Name */
          .app-name {
            font-size: 2.5rem;
            font-weight: 700;
            color: white;
            margin: 0;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            animation: fadeIn 1s ease 0.3s both;
          }

          /* Loading Text */
          .loading-text {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1rem;
            font-weight: 500;
            animation: fadeIn 1s ease 0.6s both;
          }

          .shield-icon {
            animation: bounce 1s ease-in-out infinite;
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          /* Progress Bar */
          .progress-bar {
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            animation: fadeIn 1s ease 0.9s both;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, 
              rgba(255, 255, 255, 0.8) 0%, 
              rgba(255, 255, 255, 1) 50%, 
              rgba(255, 255, 255, 0.8) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          /* Loading Dots */
          .loading-dots {
            display: flex;
            gap: 0.5rem;
            animation: fadeIn 1s ease 1.2s both;
          }

          .dot {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: dotPulse 1.4s ease-in-out infinite;
          }

          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes dotPulse {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .loading-content {
              padding: 2rem;
              gap: 1.5rem;
            }

            .logo-container {
              width: 100px;
              height: 100px;
            }

            .ring-1 {
              width: 100px;
              height: 100px;
            }

            .ring-2 {
              width: 75px;
              height: 75px;
            }

            .ring-3 {
              width: 50px;
              height: 50px;
            }

            .logo-icon {
              width: 70px;
              height: 70px;
            }

            .logo-icon svg {
              width: 40px;
              height: 40px;
            }

            .app-name {
              font-size: 2rem;
            }

            .loading-text {
              font-size: 1rem;
            }

            .progress-bar {
              width: 160px;
            }
          }
        `}</style>
      </div>
    );
  }

  return children;
}