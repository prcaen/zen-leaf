# AGENTS.md - React Native Project Guide for AI Assistants

This document provides guidance for AI coding assistants working on React Native projects. It covers common patterns, project structure, and best practices.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Development Workflow](#development-workflow)
4. [Common Tasks](#common-tasks)
5. [Code Patterns](#code-patterns)
6. [Testing](#testing)
7. [Platform-Specific Code](#platform-specific-code)
8. [State Management](#state-management)
9. [Navigation](#navigation)
10. [Styling](#styling)
11. [Performance Considerations](#performance-considerations)
12. [Common Pitfalls](#common-pitfalls)

---

## Project Structure

### Typical React Native Project Layout

```
project-root/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── state/             # State management (stores, contexts)
│   ├── lib/               # Utility functions and helpers
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── api/               # API calls and data fetching
│   └── assets/            # Images, fonts, etc.
├── android/               # Android native code
├── ios/                   # iOS native code
├── __tests__/             # Test files
├── __mocks__/             # Mock implementations for testing
├── app.config.js          # Expo configuration (if using Expo)
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

### Key Directories

- **`src/components/`**: Reusable UI components that can be used across multiple screens
- **`src/screens/`**: Full-screen components that represent app pages/views
- **`src/navigation/`**: Navigation setup and route definitions
- **`src/state/`**: Global state management (Redux, MobX, Context API, etc.)
- **`src/lib/` or `src/utils/`**: Helper functions, constants, and utilities
- **`src/hooks/`**: Custom React hooks for shared logic
- **`android/` and `ios/`**: Platform-specific native code

---

## Technology Stack

### Core Technologies

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript (common in modern projects)
- **Metro**: JavaScript bundler for React Native

### Common Navigation Libraries

- **React Navigation** (`@react-navigation/native`): Most popular navigation solution
- **React Native Navigation** (Wix): Native navigation alternative
- **Expo Router**: File-based routing for Expo projects

### Common State Management

- **React Context + Hooks**: Built-in state management
- **Redux Toolkit** (`@reduxjs/toolkit`): Predictable state container
- **MobX**: Reactive state management
- **Zustand**: Lightweight state management
- **TanStack Query** (React Query): Server state management
- **Jotai/Recoil**: Atomic state management

### Common UI Libraries

- **React Native Paper**: Material Design components
- **React Native Elements**: Cross-platform UI toolkit
- **NativeBase**: Component library
- **UI Kitten**: Theme-based components
- **Custom components**: Many projects build their own design system

### Common Utilities

- **Axios** or **fetch**: HTTP requests
- **AsyncStorage**: Local storage
- **react-native-svg**: SVG support
- **react-native-gesture-handler**: Enhanced gesture system
- **react-native-reanimated**: Advanced animations
- **Expo**: Managed workflow with many built-in modules

---

## Development Workflow

### Starting the Development Server

```bash
# For standard React Native projects
npx react-native start
# Or
npm start
# Or
yarn start

# For Expo projects
npx expo start
# Or
expo start
```

### Running on Platforms

```bash
# iOS
npx react-native run-ios
# Or for Expo
npx expo run:ios

# Android
npx react-native run-android
# Or for Expo
npx expo run:android

# Web (if supported)
npx expo start --web
```

### Installing Dependencies

```bash
# Install JS dependencies
npm install
# Or
yarn install

# iOS native dependencies (after adding native modules)
cd ios && pod install && cd ..

# For Expo
npx expo install package-name  # Ensures compatibility
```

### Common Scripts

Check `package.json` for available scripts:
- `npm run test` or `yarn test`: Run tests
- `npm run lint` or `yarn lint`: Run linter
- `npm run type-check` or `yarn type-check`: TypeScript type checking
- `npm run build:ios` or `yarn build:ios`: Build iOS app
- `npm run build:android` or `yarn build:android`: Build Android app

---

## Common Tasks

### Creating a New Component

1. **Location**: Place in `src/components/` for reusable components, `src/screens/` for screens
2. **File naming**: Use PascalCase (e.g., `MyComponent.tsx`) or kebab-case (e.g., `my-component.tsx`)
3. **Platform-specific**: Use `.ios.tsx` or `.android.tsx` extensions for platform-specific code

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### Adding a New Screen

1. Create the screen component in `src/screens/`
2. Add the route to your navigation configuration
3. Update TypeScript navigation types if using typed navigation

```typescript
// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  return (
    <View>
      <Text>Profile Screen</Text>
    </View>
  );
};
```

### Making API Calls

1. **Location**: Create API functions in `src/api/` or `src/lib/api/`
2. **Error handling**: Always handle errors appropriately
3. **Loading states**: Manage loading and error states

```typescript
// src/api/users.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.example.com';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const fetchUser = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Using in a component
import { useState, useEffect } from 'react';

const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
};
```

### Adding Native Modules

1. Install the package: `npm install package-name`
2. For iOS: `cd ios && pod install && cd ..`
3. For Expo: Use `npx expo install package-name` for compatibility
4. Rebuild the native app
5. Some packages require additional configuration in `android/app/src/main/AndroidManifest.xml` or `ios/Info.plist`

---

## Code Patterns

### Component Patterns

#### Functional Components with Hooks (Modern Approach)

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CounterProps {
  initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log(`Count changed to ${count}`);
  }, [count]);

  return (
    <View>
      <Text>Count: {count}</Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### Custom Hooks

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### Compound Components

```typescript
import React, { createContext, useContext } from 'react';
import { View, Text } from 'react-native';

interface CardContextValue {
  variant: 'default' | 'elevated';
}

const CardContext = createContext<CardContextValue>({ variant: 'default' });

export const Card: React.FC<{ variant?: 'default' | 'elevated'; children: React.ReactNode }> = ({ 
  variant = 'default', 
  children 
}) => {
  return (
    <CardContext.Provider value={{ variant }}>
      <View>{children}</View>
    </CardContext.Provider>
  );
};

Card.Title = ({ children }: { children: React.ReactNode }) => {
  const { variant } = useContext(CardContext);
  return <Text style={{ fontWeight: variant === 'elevated' ? 'bold' : 'normal' }}>{children}</Text>;
};

Card.Content = ({ children }: { children: React.ReactNode }) => {
  return <View>{children}</View>;
};
```

---

## Testing

### Test Files Location

- Place test files alongside source files: `MyComponent.test.tsx`
- Or in a dedicated `__tests__` directory
- Use `.test.tsx` or `.spec.tsx` extensions

### Testing Libraries

- **Jest**: JavaScript testing framework (comes with React Native)
- **React Native Testing Library** (`@testing-library/react-native`): Component testing
- **Detox**: End-to-end testing for React Native

### Example Component Test

```typescript
// src/components/__tests__/MyComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <MyComponent title="Press Me" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
npm test
# Or
yarn test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Platform-Specific Code

### File Extensions

React Native automatically picks the right file based on the platform:

- `Component.ios.tsx` - iOS only
- `Component.android.tsx` - Android only
- `Component.native.tsx` - Native platforms (iOS & Android)
- `Component.web.tsx` - Web only
- `Component.tsx` - All platforms (fallback)

### Platform Module

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'ios' ? 20 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

// Platform-specific code
if (Platform.OS === 'ios') {
  // iOS-specific logic
}

// Version check
if (Platform.Version >= 21) {
  // Android API level 21+
}
```

---

## State Management

### Context API Pattern

```typescript
// src/state/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // API call to login
    const userData = await loginAPI(email, password);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Redux Toolkit Pattern

```typescript
// src/state/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface User {
  id: string;
  name: string;
}

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export default userSlice.reducer;
```

---

## Navigation

### React Navigation Setup

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: { section?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### Typed Navigation

```typescript
// src/navigation/types.ts
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

// Usage in component
import { useNavigation } from '@react-navigation/native';
import type { HomeScreenNavigationProp } from '../navigation/types';

const MyComponent = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const navigateToProfile = () => {
    navigation.navigate('Profile', { userId: '123' });
  };
  
  return <Button onPress={navigateToProfile} title="Go to Profile" />;
};
```

---

## Styling

### StyleSheet API (Recommended)

```typescript
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hello</Text>
  </View>
);
```

### Common Layout Patterns

```typescript
// Flexbox (default in React Native)
const styles = StyleSheet.create({
  // Center content
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // React Native 0.71+
  },
  
  // Space between
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Absolute positioning
  absolutePosition: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
```

### Responsive Design

```typescript
import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    maxWidth: 600,
  },
  responsiveText: {
    fontSize: width > 400 ? 18 : 14,
  },
});

// Hook for responsive dimensions
import { useState, useEffect } from 'react';

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  return dimensions;
};
```

### Theme Management

```typescript
// src/theme/index.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    error: '#FF3B30',
    success: '#34C759',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
    },
  },
};

export type Theme = typeof theme;
```

---

## Performance Considerations

### Avoid Inline Functions and Objects

```typescript
// ❌ Bad - Creates new function on every render
<TouchableOpacity onPress={() => console.log('pressed')}>
  <Text>Press</Text>
</TouchableOpacity>

// ✅ Good - Reuses function reference
const handlePress = useCallback(() => {
  console.log('pressed');
}, []);

<TouchableOpacity onPress={handlePress}>
  <Text>Press</Text>
</TouchableOpacity>
```

### Memoization

```typescript
import React, { useMemo, memo } from 'react';

// Memoize expensive computations
const MyComponent = ({ items }: { items: Item[] }) => {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return <ListView items={sortedItems} />;
};

// Memoize components
export const ExpensiveComponent = memo(({ data }: { data: Data }) => {
  return <View>{/* expensive render */}</View>;
});
```

### FlatList Optimization

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemComponent item={item} />}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Image Optimization

```typescript
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image'; // Popular alternative

// Use resizeMode
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  resizeMode="cover"
  style={{ width: 100, height: 100 }}
/>

// Use FastImage for better performance
<FastImage
  source={{ uri: 'https://example.com/image.jpg', priority: FastImage.priority.normal }}
  resizeMode={FastImage.resizeMode.cover}
  style={{ width: 100, height: 100 }}
/>
```

---

## Common Pitfalls

### 1. Not Handling Keyboard

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  {/* Your form content */}
</KeyboardAvoidingView>
```

### 2. Not Handling Safe Areas

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export const Screen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    {/* Your content */}
  </SafeAreaView>
);
```

### 3. Memory Leaks in useEffect

```typescript
// ❌ Bad - No cleanup
useEffect(() => {
  const subscription = someAPI.subscribe(data => {
    setData(data);
  });
}, []);

// ✅ Good - Proper cleanup
useEffect(() => {
  const subscription = someAPI.subscribe(data => {
    setData(data);
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 4. Text Must Be in Text Component

```typescript
// ❌ Bad - Will throw error
<View>Hello World</View>

// ✅ Good
<View>
  <Text>Hello World</Text>
</View>
```

### 5. Async Operations After Unmount

```typescript
// ✅ Good - Check if component is mounted
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setData(data);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, []);
```

### 6. Not Using Keys in Lists

```typescript
// ❌ Bad
{items.map(item => <ItemComponent item={item} />)}

// ✅ Good
{items.map(item => <ItemComponent key={item.id} item={item} />)}

// ✅ Best - Use FlatList for long lists
<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>
```

---

## Additional Resources

### Official Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)

### Common Commands Reference

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear iOS build
cd ios && rm -rf build Pods && pod install && cd ..

# Clear Android build
cd android && ./gradlew clean && cd ..

# Link native dependencies (older RN versions)
npx react-native link

# Check React Native info
npx react-native info

# Upgrade React Native
npx react-native upgrade
```

---

## Best Practices Summary

1. **Use TypeScript** for type safety and better developer experience
2. **Follow component composition** patterns - keep components small and focused
3. **Optimize lists** using FlatList with proper keys and memoization
4. **Handle platform differences** explicitly using Platform module or file extensions
5. **Test your components** with React Native Testing Library
6. **Profile performance** using React DevTools and Flipper
7. **Handle errors gracefully** with proper error boundaries and user feedback
8. **Keep state close to where it's used** - lift state only when necessary
9. **Use proper navigation typing** to catch navigation errors at compile time
10. **Clean up side effects** in useEffect hooks

---

## Project-Specific Notes

When working on a specific React Native project, look for:

1. **README.md**: Project-specific setup instructions
2. **package.json**: Available scripts and dependencies
3. **app.config.js** or **app.json**: Expo configuration
4. **Navigation structure**: Check how routes are defined
5. **State management**: Identify which solution is used (Context, Redux, MobX, etc.)
6. **Styling approach**: Theme system, styled-components, or StyleSheet
7. **API configuration**: Base URLs, authentication methods
8. **Environment variables**: `.env` files and configuration
9. **Code style guide**: ESLint and Prettier configurations
10. **Testing setup**: Jest configuration and test utilities

---

*This guide is a living document. Update it as you learn more about the project's specific patterns and conventions.*

