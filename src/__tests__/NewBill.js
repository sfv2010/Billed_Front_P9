/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );
    });
    afterEach(() => {
        document.body.innerHTML = "";
        localStorage.clear();
    });
    describe("When I am on NewBill Page", () => {
        test("Then ,the content title should be displayed ", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            //to-do write assertion
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });

    describe("When I am on NewBill Page and When I upload a file  ", () => {
        test("Then,  handleChangeFile function should be called", () => {
            document.body.innerHTML = NewBillUI();
            const initNewBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const file = screen.getByTestId("file");
            const handleChangeFile = jest.fn(initNewBill.handleChangeFile);
            file.addEventListener("change", handleChangeFile);
            // The File() constructor creates a new File object instance.
            const testFile = new File(["testFile"], "test.jpg", {
                type: "image/jpg",
            });
            fireEvent.change(file, {
                target: {
                    files: [testFile],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(file.files[0].name).toBe("test.jpg");
        });
    });

    describe("when I am on NewBill Page and I click the submit button", () => {
        test("Then, handleSubmit function should be called", async () => {
            document.body.innerHTML = NewBillUI();
            const initNewBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const submit = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn(initNewBill.handleSubmit);
            submit.addEventListener("submit", handleSubmit);
            fireEvent.submit(submit);
            expect(handleSubmit).toHaveBeenCalled();
            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        });
    });
    //Post integration test
    describe("When I am on NewBill Page and I submit a valid bill form", () => {
        test("then a bill is created", async () => {
            document.body.innerHTML = NewBillUI();
            const initNewBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            //The File() constructor creates a new File object instance.
            const testFile = new File(["testFile"], "test.jpg", {
                type: "image/jpg",
            });
            const inputFile = screen.getByTestId("file");
            const handleChangeFile = jest.fn((e) =>
                initNewBill.handleChangeFile(e)
            );
            inputFile.addEventListener("change", handleChangeFile);
            fireEvent.change(inputFile, { target: { files: [testFile] } });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(inputFile.files[0].name).toBe("test.jpg");

            const createBill = jest.fn(mockStore.bills().create);
            const updateBill = jest.fn(mockStore.bills().update);
            const { fileUrl, key } = await createBill();

            expect(createBill).toHaveBeenCalled();
            expect(key).toBe("1234");
            expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");

            const newBillUpdate = await updateBill();
            expect(updateBill).toHaveBeenCalled();

            expect(newBillUpdate).toEqual({
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                    "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
            });
            let searchURL = ROUTES_PATH.Bills;
            searchURL = searchURL.slice(-5);
            expect(searchURL).toBe("bills");
        });
    });

    describe("When I click on the submit button", () => {
        test("Then posts bill with mock API POST and fails with error 404", async () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const myForm = screen.getByTestId("form-new-bill");
            jest.spyOn(mockStore.bills(), "update").mockRejectedValueOnce(
                new Error("Error 404")
            );
            try {
                fireEvent.submit(myForm);
            } catch (error) {
                expect(error.message).toBe("Error 404");
            }
        });
        test("Then posts bill with mock API POST and fails with error 500", async () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const myForm = screen.getByTestId("form-new-bill");
            jest.spyOn(mockStore.bills(), "update").mockRejectedValueOnce(
                new Error("Error 500")
            );
            try {
                fireEvent.submit(myForm);
            } catch (error) {
                expect(error.message).toBe("Error 500");
            }
        });
    });
});
