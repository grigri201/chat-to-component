import React, { useState, useEffect } from "react";
import { transform } from "@babel/standalone";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DynamicComponentLoader({
  code,
  eventCallback,
}: {
  code: string;
  eventCallback: (message: string) => void;
}) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    null
  );

  // 创建依赖映射
  const dependencies = {
    Card,
    CardHeader,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    Label,
    Input,
    Button,
    CardContent,
    CardFooter,
    CardTitle,
  };

  useEffect(() => {
    // 转译代码
    const transformed = transform(code, {
      presets: ["react"],
      filename: "DynamicComp.tsx",
    });



    // 动态创建组件
    const createComponent = new Function(
      "React",
      "dependencies",
      `
      ${transformed.code}
      return DynamicComp;
    `
    );

    setComponent(() => createComponent(React, dependencies));
  }, []);

  if (!Component) return <div>Loading...</div>;

  return <Component eventCallback={eventCallback} React={React} dependencies={dependencies} />;
}
