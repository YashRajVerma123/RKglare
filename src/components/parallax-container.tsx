
import { cn } from "@/lib/utils";
import React from "react";

interface ParallaxContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ParallaxContainer = React.forwardRef<
  HTMLDivElement,
  ParallaxContainerProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-full w-full overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
      className,
    )}
    {...props}
  >
    <div className="parallax h-full w-full">{props.children}</div>
  </div>
));

ParallaxContainer.displayName = "ParallaxContainer";

export default ParallaxContainer;

    