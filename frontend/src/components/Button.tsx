import React from "react";

interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({ label, onClick, type }) => {
    return (
        <button onClick={onClick} type={type}>
            {label}
        </button>
    );
};

export default Button;