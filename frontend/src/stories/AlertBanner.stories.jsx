import React from "react";
import AlertBanner from "../components/AlertBanner.jsx";

export default {
  title: "Components/AlertBanner",
  component: AlertBanner,
};

export const Default = () => <AlertBanner message="This is an alert!" />;
export const Empty = () => <AlertBanner message="" />;
