import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import React from "react";

// Define the component props interface directly
interface EmptyPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode; // Action is now optional
}

const EmptyPage: React.FC<EmptyPageProps> = ({
  icon,
  title,
  description,
  action, // Destructured
}) => {
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        {/* The icon provides a visual focus */}
        <EmptyMedia variant="icon">{icon}</EmptyMedia>

        {/* Title and Description provide context */}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>

      {/* Conditionally render the action/content block */}
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
};

export default EmptyPage;
