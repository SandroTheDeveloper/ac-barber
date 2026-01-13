import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUserRole } from "@/hooks/use-role-user";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role, loading } = useUserRole();

  if (loading) return null; // evita flicker

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="disponibilità"
        options={{
          title: "Disponibilità",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="calendar-alt" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mio profilo"
        options={{
          title: "Mio Profilo",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user" size={24} color={color} />
          ),
        }}
      />

      {/* 🔐 SOLO ADMIN */}
      <Tabs.Screen
        name="gestione clienti"
        options={{
          title: "Gestione clienti",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users-cog" size={24} color={color} />
          ),
          href: role === "ADMIN" ? undefined : null,
        }}
      />
    </Tabs>
  );
}
