"use client";

import { Transition } from "@/components/Transition";
import Deployments from "@/contexts/Deployments";
import LoadingScreen from "@/contexts/LoadingScreen";
import LoginModal from "@/contexts/LoginModal";
import Namespaces from "@/contexts/Namespaces";
import PasswordModal from "@/contexts/PasswordModal";
import Pods from "@/contexts/Pods";
import User from "@/contexts/User";
import Login from "./login";
import Home from "./home";

function Content() {
    const user = User.useThis();

    switch (user.isLoggedIn) {
        case "yes":
            return <Home />;
        case "no":
            return <Login />;
        case "loading":
            return <></>;
    }
}

export default function Page() {
    return (
        <Transition.Provider>
            <LoadingScreen.Provider>
                <User.Provider>
                    <PasswordModal.Provider>
                        <Namespaces.Provider>
                            <Deployments.Provider>
                                <Pods.Provider>
                                    <LoginModal.Provider>
                                        <Content />
                                    </LoginModal.Provider>
                                </Pods.Provider>
                            </Deployments.Provider>
                        </Namespaces.Provider>
                    </PasswordModal.Provider>
                </User.Provider>
            </LoadingScreen.Provider>
        </Transition.Provider>
    );
}
