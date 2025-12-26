import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

export default function ContactUs() {
  const { user, isSignedIn } = useUser();

  const [formData, setFormData] = useState({
    name: isSignedIn
      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
      : "",
    email: isSignedIn ? user?.primaryEmailAddress?.emailAddress || "" : "",
    phone: "",
    subject_type: "",
    message: "",
    sms_consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8000/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: isSignedIn
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
            : "",
          email: isSignedIn
            ? user?.primaryEmailAddress?.emailAddress || ""
            : "",
          phone: "",
          subject_type: "",
          message: "",
          sms_consent: false,
        });

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Failed to submit form. Please try again.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get in Touch with <span className="text-red-600">Nexxa</span>{" "}
            Auto Parts
          </h1>
          <p className="text-gray-600">
            We're here to help! Fill out the form below and we'll get back to
            you soon.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-600 text-2xl mr-3">✓</span>
              <div>
                <h3 className="text-green-900 font-semibold">
                  Message Sent Successfully!
                </h3>
                <p className="text-green-700 text-sm">
                  Thank you for contacting us. We'll get back to you within
                  24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 text-2xl mr-3">⚠</span>
              <div>
                <h3 className="text-red-900 font-semibold">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send a message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="+1 (234) 567-8900"
              />
            </div>

            {/* Subject Type */}
            <div>
              <label
                htmlFor="subject_type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject type *
              </label>
              <select
                id="subject_type"
                name="subject_type"
                value={formData.subject_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="parts">Parts Inquiry</option>
                <option value="order">Order Status</option>
                <option value="support">Technical Support</option>
                <option value="feedback">Feedback</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>

            {/* SMS Consent */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="sms_consent"
                name="sms_consent"
                checked={formData.sms_consent}
                onChange={handleChange}
                className="mt-1 h-5 w-5 text-red-600 focus:ring-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="sms_consent"
                className="ml-3 text-sm text-gray-700"
              >
                By checking this box, you agree to receive customer care,
                account notifications and delivery notification SMS messages
                from NEXXA AUTO PARTS related to Appointment reminders,
                Follow-up messages, Account Updates and Delivery notifications.
                You may reply STOP to opt-out at any time. Reply HELP to (463)
                223-5914 for assistance. Messages and data rates may apply.
                Message frequency will vary. Learn more on our privacy policy
                page and Term & Conditions.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 text-white font-semibold rounded-lg transition-colors ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>Or reach us directly:</p>
          <p className="mt-2">
            <strong>Phone:</strong> (463) 223-5914
          </p>
          <p>
            <strong>Email:</strong> support@nexxa.com
          </p>
        </div>
      </div>
    </div>
  );
}
