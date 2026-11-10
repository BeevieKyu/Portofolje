// components/InfoCard.jsx
import "../styles/styles.css";

export default function InfoCard({
  image,               // string URL (optional)
  title,               // string or node (optional)
  description,         // string or node (optional)
  action,              // React node (optional) e.g., <Button> or <a>
  className = "",      // extra classes from the page
  imgAlt,              // optional alt text (fallback to title)
  ...rest
}) {
  return (
    <div className={`info-card ${className}`} {...rest}>
      {image && (
        <figure className="info-card__media">
          <img className="info-card__image" src={image} alt={imgAlt || title || "Card image"} />
        </figure>
      )}

      {title && <h2 className="info-card__title">{title}</h2>}

      {description && <div className="info-card__description">{description}</div>}

      <div className="info-card__actions">
      {action && <div>{action}</div>}
      </div>
    </div>
  );
}