"use client";

import BigRedButton from "@/components/BigRedButton";
import LoginModal from "@/contexts/LoginModal";
import { SkullIcon } from "lucide-react";

export default function Login() {
    const login = LoginModal.useThis();

    return (
        <div className="flex justify-center h-lvh w-full relative items-center gap-32">
            <BigRedButton
                icon={<SkullIcon size={64} />}
                onClick={() => login.setVisible(true)}
            />
        </div>
    );
}
