import React, { useState } from "react";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const result = await response.json();
      alert(result.message); // Success or error message
    } catch (error) {
      console.error("Error during OTP verification:", error);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>OTP Verification</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <button type="submit">Verify OTP</button>
    </form>
  );
};

export default OtpVerification;
