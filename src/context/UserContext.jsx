import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Gunakan sessionStorage (bukan localStorage) agar sesi habis saat browser ditutup
        const storedUser = sessionStorage.getItem('simtik_user_details')
        return storedUser ? JSON.parse(storedUser) : {
            name: "Admin Inspektorat",
            email: "admin@inspektorat.example.com",
            role: "admin"
        }
    });

    const updateUser = (updates) => {
        setUser(prev => {
            const newUser = { ...prev, ...updates }
            // Pastikan passwordHash tidak tersimpan di context / sessionStorage
            const { passwordHash, password, ...safeUser } = newUser
            sessionStorage.setItem('simtik_user_details', JSON.stringify(safeUser))
            return safeUser
        });
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
