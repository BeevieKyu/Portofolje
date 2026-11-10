import HCAILogo from '../../assets/hcai-logo.png';
import '../../styles/styles.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <div className="footer-logo-bubble">
            <img src={HCAILogo} alt="HCAI Logo" className="footer-logo-img" />
          </div>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <a href="mailto:eleftherios.papachristos@ntnu.no">Mail: eleftherios.papachristos@ntnu.no</a>
          <p>Address: Raufossvegen 40, 2821 Gjøvik</p>
        </div>
        <div className="footer-bottom">
          <a href="#">Admin Login</a>
        </div>
      </div>
    </footer>
  );
}