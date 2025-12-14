import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { useQuery } from "@tanstack/react-query";
import { getSetting } from "./setting.action";
import SettingForm from "./setting.form";
import { KeyValueType, SettingKey } from "./setting.response";

// --- Reusable Component for fetching and displaying one setting ---
function SettingSection({
  settingKey,
  title,
  description,
  type,
}: {
  settingKey: SettingKey;
  title: string;
  description: string;
  type: KeyValueType;
}) {
  const {
    data: settingData,
    isLoading,
    isError,
    // Note: If you have an ErrorPage component, you might want to use it here or handle the error more gracefully within the section.
    error,
    refetch,
  } = useQuery({
    queryKey: [settingKey],
    queryFn: async () => {
      const data = await getSetting({ settingKey });
      if (data.response) {
        return data.response.result.payload.value;
      } else {
        throw data.error;
      }
    },
  });

  if (isLoading) {
    // Consistent Loading State: Use a simple skeleton for a single setting entry
    return (
      <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50/50 animate-pulse transition-colors">
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-64"></div>
          <div className="h-3 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (isError) {
    // A clear error block for the individual setting
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="font-semibold text-red-700">Error loading {title}:</p>
        <p className="text-sm text-red-600">
          {error?.message || "An unknown error occurred."}
        </p>
      </div>
    );
  }

  return (
    <SettingForm
      title={title}
      description={description}
      // Pass the fetched value, defaulting to "" if somehow undefined
      data={{ value: settingData ?? "" }}
      onSubmitComplete={() => {
        // Refetch the data after a successful update
        refetch();
      }}
      settingKey={settingKey}
      type={type}
    />
  );
}

// --- Main Setting Page Component ---
function SettingPage() {
  return (
    <Card className="m-6 h-full">
      <CardHeader>
        <CardTitle className="text-xl">System Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage key operational rules and behaviors for your application.
        </p>
      </CardHeader>

      <CardContent className="h-full">
        {/* Wrap settings in ScrollArea to match ProductTypePage scrollable area */}
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* --- Application Flow Settings --- */}
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">
              Sales & Inventory Rules
            </h2>

            <SettingSection
              title="Inventory Over-Selling"
              description="Allow selling items even if the current stock is zero or negative. (Stock မရှိလည်းရောင်းခွင့် ရှိ / မရှိ)"
              settingKey={SettingKey.StockSetting}
              type={KeyValueType.BOOLEAN}
            />

            <SettingSection
              title="Credit Limit Override"
              description="Allow sales transactions that would exceed the customer's current credit limit. (အကြွေးဝယ်သူ limit ထပ်ကျော်လွန်ပါက ရောင်းခွင့် ရှိ / မရှိ)"
              settingKey={SettingKey.LimitSetting}
              type={KeyValueType.BOOLEAN}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SettingPage;
