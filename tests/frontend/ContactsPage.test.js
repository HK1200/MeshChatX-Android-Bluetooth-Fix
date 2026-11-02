import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactsPage from "@/components/contacts/ContactsPage.vue";
import WebSocketConnection from "@/js/WebSocketConnection";
import ToastUtils from "@/js/ToastUtils";
import DialogUtils from "@/js/DialogUtils";

vi.mock("@/js/WebSocketConnection", () => ({
    default: {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
    },
}));

vi.mock("@/js/ToastUtils", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
        loading: vi.fn(),
        dismiss: vi.fn(),
    },
}));

vi.mock("qrcode", () => ({
    default: {
        toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,test"),
    },
}));

describe("ContactsPage.vue", () => {
    let axiosMock;

    beforeEach(() => {
        vi.clearAllMocks();
        axiosMock = {
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
        };
        window.api = axiosMock;

        axiosMock.get.mockImplementation((url) => {
            if (url === "/api/v1/config") {
                return Promise.resolve({
                    data: {
                        config: {
                            lxmf_address_hash: "a".repeat(32),
                            identity_public_key: "b".repeat(128),
                        },
                    },
                });
            }
            if (url === "/api/v1/telephone/contacts/export") {
                return Promise.resolve({ data: { contacts: [] } });
            }
            if (url.startsWith("/api/v1/telephone/contacts/check/")) {
                return Promise.resolve({ data: { is_contact: false, contact: null } });
            }
            if (
                url === "/api/v1/telephone/contacts" ||
                (typeof url === "string" && url.startsWith("/api/v1/telephone/contacts?"))
            ) {
                return Promise.resolve({ data: { contacts: [], total_count: 0 } });
            }
            return Promise.resolve({ data: {} });
        });
    });

    const mountPage = () =>
        mount(ContactsPage, {
            global: {
                mocks: {
                    $t: (key) => key,
                },
                stubs: {
                    MaterialDesignIcon: true,
                },
            },
        });

    it("does not rename an unrelated same-name identity", async () => {
        const wrapper = mountPage();
        const prompt = vi.spyOn(DialogUtils, "prompt").mockResolvedValue("Renamed");
        try {
            await flushPromises();
            const contact = { id: 12, name: "Casey", remote_identity_hash: "a".repeat(32) };
            wrapper.vm.contacts = [
                contact,
                { ...contact, id: 13 },
                { ...contact, id: 14, remote_identity_hash: "b".repeat(32) },
            ];
            axiosMock.patch = vi.fn().mockResolvedValue({ data: {} });
            axiosMock.post.mockResolvedValue({ data: {} });
            await wrapper.vm.editContactName(contact);
            expect(axiosMock.patch.mock.calls.map((call) => call[0])).toEqual([
                "/api/v1/telephone/contacts/12",
                "/api/v1/telephone/contacts/13",
            ]);
        } finally {
            prompt.mockRestore();
            wrapper.unmount();
        }
    });
    it("cancels an old identity's pending name prompt before any write", async () => {
        const wrapper = mountPage();
        let finish;
        const prompt = vi.spyOn(DialogUtils, "prompt").mockReturnValue(
            new Promise((resolve) => {
                finish = resolve;
            })
        );
        try {
            await flushPromises();
            axiosMock.patch = vi.fn();
            const pending = wrapper.vm.editContactName({ id: 12, name: "Casey", remote_identity_hash: "a".repeat(32) });
            await wrapper.vm.onIdentitySwitched();
            finish("Renamed");
            await pending;
            expect(axiosMock.patch).not.toHaveBeenCalled();
            expect(axiosMock.post).not.toHaveBeenCalled();
        } finally {
            prompt.mockRestore();
            wrapper.unmount();
        }
    });

    it("parses lxma URI correctly", () => {
        const wrapper = mountPage();
        const result = wrapper.vm.parseLxmaUri(`lxma://${"c".repeat(32)}:${"d".repeat(128)}`);
        expect(result.destinationHash).toBe("c".repeat(32));
        expect(result.publicKeyHex).toBe("d".repeat(128));
    });

    it("adds contact using manual destination hash", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();
        wrapper.vm.newContactInput = "e".repeat(32);
        wrapper.vm.newContactName = "Test Contact";

        await wrapper.vm.submitAddContact();

        expect(axiosMock.post).toHaveBeenCalledWith("/api/v1/telephone/contacts", {
            name: "Test Contact",
            lxmf_address: "e".repeat(32),
        });
    });

    it("uses websocket ingest for lxma URI input", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();
        wrapper.vm.newContactInput = `lxma://${"f".repeat(32)}:${"1".repeat(128)}`;

        await wrapper.vm.submitAddContact();

        expect(WebSocketConnection.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: "lxm.ingest_uri",
                uri: `lxma://${"f".repeat(32)}:${"1".repeat(128)}`,
            })
        );
        expect(axiosMock.post).not.toHaveBeenCalled();
    });

    it("exports contacts via GET /api/v1/telephone/contacts/export", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();

        await wrapper.vm.exportContacts();

        expect(axiosMock.get).toHaveBeenCalledWith("/api/v1/telephone/contacts/export");
    });

    it("imports contacts via POST /api/v1/telephone/contacts/import", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();
        axiosMock.post.mockResolvedValue({ data: { added: 2, skipped: 0 } });

        await wrapper.vm.importContacts([
            { name: "A", remote_identity_hash: "a".repeat(32) },
            { name: "B", remote_identity_hash: "b".repeat(32) },
        ]);

        expect(axiosMock.post).toHaveBeenCalledWith("/api/v1/telephone/contacts/import", {
            contacts: [
                { name: "A", remote_identity_hash: "a".repeat(32) },
                { name: "B", remote_identity_hash: "b".repeat(32) },
            ],
        });
    });

    it("mounts within 3000ms", () => {
        const start = performance.now();
        const wrapper = mountPage();
        const elapsed = performance.now() - start;
        expect(wrapper.find("h1").exists()).toBe(true);
        expect(elapsed).toBeLessThan(3000);
    });

    it("export and import buttons are present", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();
        const html = wrapper.html();
        expect(html).toContain("contacts.export_contacts");
        expect(html).toContain("contacts.import_contacts");
    });

    it("keeps Add contact in the header instead of covering the last row", async () => {
        const wrapper = mountPage();
        await wrapper.vm.$nextTick();
        const mobileFab = wrapper.find('button[title="contacts.add_contact"]');
        expect(mobileFab.exists()).toBe(true);
        expect(mobileFab.classes()).not.toContain("fixed");
        expect(mobileFab.classes()).not.toContain("hidden");
        await mobileFab.trigger("click");
        expect(wrapper.vm.isAddDialogOpen).toBe(true);
    });

    it("getContacts maps total_count from telephone contacts API", async () => {
        axiosMock.get.mockImplementation((url) => {
            if (url === "/api/v1/config") {
                return Promise.resolve({
                    data: {
                        config: {
                            lxmf_address_hash: "a".repeat(32),
                            identity_public_key: "b".repeat(128),
                        },
                    },
                });
            }
            if (
                url === "/api/v1/telephone/contacts" ||
                (typeof url === "string" && url.startsWith("/api/v1/telephone/contacts?"))
            ) {
                return Promise.resolve({
                    data: {
                        contacts: [{ id: 1, name: "One", remote_identity_hash: "c".repeat(32) }],
                        total_count: 42,
                    },
                });
            }
            if (url === "/api/v1/telephone/contacts/export") {
                return Promise.resolve({ data: { contacts: [] } });
            }
            if (url.startsWith("/api/v1/telephone/contacts/check/")) {
                return Promise.resolve({ data: { is_contact: false, contact: null } });
            }
            return Promise.resolve({ data: {} });
        });
        const wrapper = mountPage();
        await flushPromises();
        expect(wrapper.vm.totalContactsCount).toBe(42);
        expect(wrapper.vm.contacts).toHaveLength(1);
        expect(wrapper.vm.contacts[0].name).toBe("One");
    });

    it("toasts failed_load_contacts when contacts GET fails", async () => {
        axiosMock.get.mockImplementation((url) => {
            if (url === "/api/v1/config") {
                return Promise.resolve({
                    data: {
                        config: {
                            lxmf_address_hash: "a".repeat(32),
                            identity_public_key: "b".repeat(128),
                        },
                    },
                });
            }
            if (
                url === "/api/v1/telephone/contacts" ||
                (typeof url === "string" && url.startsWith("/api/v1/telephone/contacts?"))
            ) {
                return Promise.reject(
                    Object.assign(new Error("HTTP 500"), {
                        response: { status: 500, data: { error: "boom" } },
                    })
                );
            }
            return Promise.resolve({ data: {} });
        });

        mountPage();
        await flushPromises();
        await vi.waitFor(() => expect(ToastUtils.error).toHaveBeenCalledWith("contacts.failed_load_contacts"));
    });
    it("reports a failed rename without writing the display name", async () => {
        const wrapper = mountPage();
        await flushPromises();
        vi.spyOn(DialogUtils, "prompt").mockResolvedValue("New name");
        axiosMock.patch = vi.fn().mockRejectedValueOnce(new Error("Offline"));
        await wrapper.vm.editContactName({ id: 12, name: "Old name" });
        expect(ToastUtils.error).toHaveBeenCalledWith("contacts.failed_update_contact");
        expect(axiosMock.post).not.toHaveBeenCalled();
        wrapper.unmount();
    });
});
