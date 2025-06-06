import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check, Loader } from 'lucide-react';
import Slider from 'react-slick';
import './Pricing.css';
import Header from '../components/Header/Header';
import toast from 'react-hot-toast';

// Make sure to install these packages:
// npm install react-slick slick-carousel
// Then import CSS in your index.js or App.js:
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Fallback plans in case API fails
const fallbackPlans = [
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
    name: "Basic Plan"
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
    name: "Popular Plan"
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
    name: "Pro Plan"
  },
];

// API endpoint for pricing plans
const API_URL = 'https://dolphin-app-oxsn4.ondigitalocean.app/api/v1';
const RAZORPAY_KEY_ID = 'rzp_test_EKVCvQ6b9DoeSm';

const Pricing = ({ isModal = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/plans`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }
        
        const data = await response.json();
        
        // Transform API data to match the format needed for rendering
        const formattedPlans = data.map(plan => ({
          _id: plan._id,
          name: plan.name,
          badge: plan.name === 'Basic Plan' ? '15% OFF' : 
                 plan.name === 'Popular Plan' ? 'POPULAR' : '30% OFF',
          price: `${plan.offerPrice}/-`,
          oldPrice: `${plan.price}/-`,
          features: plan.features,
          promo: true,
          popular: plan.name === 'Popular Plan'
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        setError(error.message);
        // Use fallback plans if API fails
        setPlans(fallbackPlans);
        toast.error('Could not load latest pricing. Showing default prices.');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
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

  const handlePromoChange = (e) => {
    setPromoCode(e.target.value);
  };

  const handleBuyNow = async (plan) => {
    try {
      // Get user info from localStorage
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        toast.error('Please login to purchase a plan');
        return;
      }

      // Show loading state
      const loadingToast = toast.loading('Initializing payment...');
      
      // Make API request to initiate payment
      const response = await fetch(`${API_URL}/purchase-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan._id,
          userId: userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }
      
      const orderData = await response.json();
      toast.dismiss(loadingToast);

      // Initialize Razorpay
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Thumbnail Generator",
        description: `Purchase ${plan.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_URL}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: orderData.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId: plan._id,
                userId: userId
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast.success('Payment successful! Your plan has been activated.');
              // Optionally refresh the page or update UI
              window.location.reload();
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          // You can prefill user details if available
          // name: user.name,
          // email: user.email,
          // contact: user.phone
        },
        theme: {
          color: "#3399cc"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.dismiss();
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  const renderPricingCards = () => {
    if (loading) {
      return (
        <div className="pricing-loading">
          <Loader size={40} className="spinner" />
          <p>Loading pricing plans...</p>
        </div>
      );
    }

    if (error && plans.length === 0) {
      return (
        <div className="pricing-error">
          <p>Failed to load pricing plans. Please try again later.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }

    return plans.map((plan, idx) => (
      <div
        key={plan._id || idx}
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
            <li key={i}>
              <Check size={16} className="feature-icon" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="pricing-promo-bar">PROMO CODE</div>
        <input
          type="text"
          placeholder="THUMBNAIL10"
          className="pricing-promo"
          onChange={handlePromoChange}
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