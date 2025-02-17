import React, { useState, useEffect } from "react";
import { transform } from "@babel/standalone";
import { PlaceOrder } from "../form/PlaceOrder";

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
    PlaceOrder
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
