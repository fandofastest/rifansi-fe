"use client";
import React from "react";
import Button from "../ui/button/Button";
import { useModalContext } from "@/context/ModalContext";

export default function AddUserButton() {
  const { openModal } = useModalContext();

  return (
    <Button size="sm" onClick={openModal}>
      Add User
    </Button>
  );
} 