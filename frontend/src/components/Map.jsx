import React from "react";

const Map = () => {
  return (
    <div className="w-full h-100 overflow-hidden shadow-lg">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.1764051299356!2d72.80487857476089!3d21.224852281015572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f377d924367%3A0x2485b7d77804ef14!2sUPQOR%20Private%20Limited!5e0!3m2!1sen!2sin!4v1770886597509!5m2!1sen!2sin"
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0 }}
      />
    </div>
  );
};

export default Map;