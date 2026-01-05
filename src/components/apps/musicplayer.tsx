import React from "react";

export default function Firefox() {
    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "black" }}>
            <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: "12px" }}
                src="https://open.spotify.com/embed/playlist/4uIHmyS7w13fA5VD9X8rmB?utm_source=generator&theme=0"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
        </div>
    );
}