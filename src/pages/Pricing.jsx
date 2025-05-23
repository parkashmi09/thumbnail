import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import Slider from 'react-slick';
import './Pricing.css';
import Header from '../components/Header/Header';

// Make sure to install these packages:
// npm install react-slick slick-carousel
// Then import CSS in your index.js or App.js:
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const plans = [
  {
    badge: '15% OFF',
    price: '299/-',
    oldPrice: '399/-',
    features: [
      'Limited templates',
      'Watermark on exports',
      'No PSD download',
      '5 downloads per day'
    ],
    promo: true,
    popular: false,
  },
  {
    badge: 'POPULAR',
    price: '599/-',
    oldPrice: '999/-',
    features: [
      'Unlimited templates',
      'No watermark',
      'PSD export',
      'Background remover',
      '15 downloads per day'
    ],
    promo: true,
    popular: true,
  },
  {
    badge: '30% OFF',
    price: '2499/-',
    oldPrice: '3599/-',
    features: [
      'Unlimited templates',
      'No watermark',
      'PSD export',
      'AI tools',
      'Font upload',
      'Unlimited downloads'
    ],
    promo: true,
    popular: false,
  },
];

const Pricing = ({ isModal = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    // Function to check if viewport is mobile size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Slick slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: '0px',
    className: 'center',
    pauseOnHover: true,
    swipeToSlide: true,
    focusOnSelect: true,
  };

  const handlePromoChange = (e, idx) => {
    setPromoCode(e.target.value);
  };

  const handleBuyNow = (plan) => {
    // Handle purchase logic
    alert(`You've selected the ${plan.price} plan!`);
  };

  const renderPricingCards = () => {
    return plans.map((plan, idx) => (
      <div
        key={idx}
        className={
          "pricing-card" + (plan.popular ? " popular" : "")
        }
      >
        <div className="ribbon-container">
          <div className="ribbon">
            {plan.badge}
          </div>
        </div>
        <div className="pricing-price">{plan.price}</div>
        <div className="pricing-oldprice">{plan.oldPrice}</div>
        <ul className="pricing-features">
          {plan.features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
        <div className="pricing-promo-bar">PROMO CODE</div>
        <input
          type="text"
          placeholder="THUMBNAIL10"
          className="pricing-promo"
          onChange={(e) => handlePromoChange(e, idx)}
          value={promoCode}
        />
        <button 
          className="pricing-buynow"
          onClick={() => handleBuyNow(plan)}
        >
          BUY NOW
          <span className="pricing-basket"><ShoppingCart size={22} /></span>
        </button>
      </div>
    ));
  };

  const Content = () => (
    <div className={isModal ? "pricing-modal-view" : "pricing-root"}>
      <div className="pricing-modal">
        <h2 className="pricing-title">
          "PRO-LEVEL THUMBNAIL, SUPER AFFORDABLE PRICE"
        </h2>
        
        {isMobile ? (
          <div className="pricing-carousel">
            <Slider {...sliderSettings}>
              {renderPricingCards()}
            </Slider>
          </div>
        ) : (
          <div className="pricing-cards">
            {renderPricingCards()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pricing-layout">
      {!isModal && <Header />}
      <Content />
    </div>
  );
};

export default Pricing;