import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GetProfiles, SaveProfile, DeleteProfile, TestConnection, Connect, Disconnect, GetActiveSessions } from '../../wailsjs/go/connection/ConnectionService'; // Adjust path if needed
import { connection } from '../../wailsjs/go/models';

export const useProfiles = () => {
    return useQuery({
        queryKey: ['profiles'],
        queryFn: GetProfiles,
    });
};

export const useSaveProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ profile, password }: { profile: connection.Connection, password: string }) => SaveProfile(profile, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
};

export const useDeleteProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: DeleteProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
    });
};

export const useTestConnection = () => {
    return useMutation({
        mutationFn: ({ profile, password }: { profile: connection.Connection, password: string }) => TestConnection(profile, password),
    });
};

export const useActiveSessions = () => {
    return useQuery({
        queryKey: ['sessions'],
        queryFn: GetActiveSessions,
        refetchInterval: 5000, // Poll every 5s for status updates
    });
};

export const useConnect = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profileId: string) => Connect(profileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
};

export const useDisconnect = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => Disconnect(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });
};
