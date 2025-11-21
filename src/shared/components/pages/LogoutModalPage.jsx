import React from "react";
import { useModal } from "../../../core/stores/uiStore";
import { useAuthStore } from "../../../features/auth/stores/authStore";

const LogoutModal = () => {
    const modal = useModal("logoutModal");
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        modal.close();
        logout()
    };


    if (!modal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Logout</h2>
                    <button
                        type="button"
                        onClick={modal.close}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <p>
                        You're about to logout.
                    </p>
                    <p>Are you sure you want to continue?</p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={modal.close}
                        className="rounded-lg hover:cursor-pointer border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg hover:cursor-pointer bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;