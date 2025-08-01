"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { easyContext } from "../lib/contexting";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default easyContext((children) => {
    const [visible, setVisible] = useState(false);
    const [callback, setCallback] = useState<(password: string) => any>();
    const [password, setPassword] = useState("");

    function onSubmit() {
        callback?.(password);
        setPassword("");
        setVisible(false);
    }

    return {
        value: {
            visible,
            setVisible(visible: boolean) {
                setPassword("");
                setVisible(visible);
            },
            setCallback(callback: (password: string) => any) {
                setCallback(() => callback);
            },
        },
        children: (
            <>
                {children}
                <Dialog open={visible} onOpenChange={setVisible}>
                    <DialogContent className="w-sm">
                        <DialogHeader>
                            <DialogTitle>Password Required</DialogTitle>
                            <DialogDescription>
                                Please enter the password to continue.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
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
                                variant="destructive"
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
