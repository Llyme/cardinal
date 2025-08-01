"use client";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { easyContext } from "../lib/contexting";
import { Button } from "@/components/ui/button";
import { MouseEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import User from "./User";
import { Transition } from "@/components/Transition";

export default easyContext((children) => {
    const transition = Transition.useThis();
    const user = User.useThis();
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: MouseEvent<HTMLButtonElement>) {
        await transition.show();
        await user.login(username, password);

        setUsername("");
        setPassword("");
        setVisible(false);

        await transition.hide({
            startX: e.clientX,
            startY: e.clientY,
        });
    }

    return {
        value: {
            visible,

            setVisible(visible: boolean) {
                setUsername("");
                setPassword("");
                setVisible(visible);
            },
        },
        children: (
            <>
                {children}
                <Dialog open={visible} onOpenChange={setVisible}>
                    <DialogContent className="w-sm">
                        <DialogHeader>
                            <DialogTitle>Login</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    name="username"
                                    type="text"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    name="password"
                                    type="password"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                value="Submit"
                                onClick={onSubmit}
                            >
                                Submit
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        ),
    };
});
