import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IntroSlider.css';
import burger from '../assets/burger-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/fries-blur.png';

const IntroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const slides = [
        {
            title: "Meal Planning Made Simple",
            description: "Take the stress out of your day with better meal planning",
            image: burger
        },
        {
            title: "Simplify Your Grocery",
            description: "Now you'll know what exactly what you buy",
            image: pizza
        },
        {
            title: "Share with your Family, Friends, and Partner",
            description: "No need to ask each other \"What's for dinner?\". Instantly share your meal planning and your Groceries",
            image: salad
        }
    ];

    const handleNext = () => {
        if (currentSlide === slides.length - 1) {
            localStorage.setItem('hasSeenIntro', 'true');
            navigate('/login');
        } else {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSeenIntro', 'true');
        navigate('/login');
    };

    return (
        <div className="intro-slider">
            <div className="slide">
                <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title}
                    className="slide-image"
                />
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].description}</p>
                
                <div className="dots">
                    {slides.map((_, index) => (
                        <div 
                            key={index} 
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                        />
                    ))}
                </div>
                
                <button 
                    className="next-button"
                    onClick={handleNext}
                >
                    {currentSlide === slides.length - 1 ? 'GET STARTED' : 'Next'}
                </button>
                
                {currentSlide !== slides.length - 1 && (
                    <button 
                        className="skip-button"
                        onClick={handleSkip}
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
};

export default IntroSlider;
