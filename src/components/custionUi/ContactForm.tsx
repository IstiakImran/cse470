"use client";
import React from "react";
import { Send } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  //   const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/contact", formData);

      if (response.data.success) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you soon.",
        });
      }
      //   setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
      //   setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 text-center mb-8">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-700 text-center mb-12">
            We&apos;re here to help and answer any questions you might have
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2" size={20} />
                  </>
                )}
              </button>

              {/* {status === "success" && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  Thank you for your message! We&apos;ll get back to you soon.
                </div>
              )}

              {status === "error" && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  Something went wrong. Please try again later.
                </div>
              )} */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
