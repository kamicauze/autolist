"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReplyForm() {
  return (
    <div className="bg-gray-50 rounded-xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Leave a Reply</h3>
        <p className="text-sm text-gray-500">
          Your email address will not be published
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          What is your rating?
        </label>
        <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
                <button key={i} className="text-gray-300 hover:text-yellow-400 transition-colors">
                    <Star className="w-5 h-5 fill-current" />
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input placeholder="Your name" className="bg-white" />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <Input placeholder="Your email" type="email" className="bg-white" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Review</label>
        <Textarea 
            placeholder="Write your review here..." 
            className="bg-white min-h-[120px]" 
        />
      </div>

      <div className="flex items-start gap-2">
        <input 
            type="checkbox" 
            id="save-info" 
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="save-info" className="text-sm text-gray-600">
            Save my name, email, and website in this browser for the next time I comment.
        </label>
      </div>

      <Button className="w-full sm:w-auto px-8 bg-[#2C52D8] hover:bg-[#2546b8]">
        Post Comment
      </Button>
    </div>
  );
}
