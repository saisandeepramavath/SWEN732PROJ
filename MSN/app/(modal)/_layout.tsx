// app/(modals)/_layout.tsx
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add"
        options={{
          presentation: 'modal', // This makes it slide up
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="selectPayer"
        options={{
          presentation: 'modal', // This makes it slide up
          headerShown: false,
        }}
      />
      <Stack.Screen name="addMember" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
