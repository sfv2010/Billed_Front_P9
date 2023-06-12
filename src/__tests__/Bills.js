/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills";
import router from "../app/Router.js";

//Mock part of the module
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    //Mock the localStorage object. Define a new property for the window object's localStorage property using the Object.defineProperty(obj, prop, descriptor)
    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        // //The data is saved in JSON format for the key "user".
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

    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            //Create root element:separate DOM element is created for each test case, and we can get accurate test results without affecting the state of other tests or your application while the test is running.
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            const windowIcon = await waitFor(() =>
                screen.getByTestId("icon-window")
            );
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });
    describe("When I am on Bills Page and I click on the New Bill button", () => {
        test("Then, It should renders New Bill page", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            //simulate a page change in the application
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            // Init Bills
            const initBills = new Bills({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            // check if the handleClickNewBill function has been called or not when the user clicks on the "New Bill" button
            const handleClickNewBill = jest.fn(initBills.handleClickNewBill);
            //await waitFor(() => screen.getByTestId("btn-new-bill"));
            const newBillButton = screen.getByTestId("btn-new-bill");

            newBillButton.addEventListener("click", handleClickNewBill);
            //The event will be fired as if the user clicked the button
            fireEvent.click(newBillButton);

            expect(handleClickNewBill).toHaveBeenCalled();
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });
    describe("When I am on Bills Page and I click on the icon eye", () => {
        test("Then,the modal should open", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const initBills = new Bills({
                document,
                onNavigate: null,
                store: null,
                localStorage: window.localStorage,
            });

            const eye = screen.getAllByTestId("icon-eye")[0];
            //Mock $.fn.modal.Syntax for mocking jQuery modal methods because the test execution environment needs a modal method
            $.fn.modal = jest.fn();
            // Mock function handleClickIconEye
            const handleClickIconEye = jest.fn(() =>
                initBills.handleClickIconEye(eye)
            );
            eye.addEventListener("click", handleClickIconEye);
            fireEvent.click(eye);
            expect(handleClickIconEye).toHaveBeenCalled();
            expect($.fn.modal).toHaveBeenCalled();
            expect(screen.getAllByText("Justificatif")).toBeTruthy();
        });
    });
    // GET integration test
    describe("When I navigate to Bills", () => {
        test("Then,fetches bills from mock API GET", async () => {
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            const myExpenseReports = await waitFor(() =>
                screen.getByText("Mes notes de frais")
            );
            expect(myExpenseReports).toBeTruthy();
            const mockStoreBills = new Bills({
                document,
                onNavigate: null,
                store: mockStore,
                localStorage: window.localStorage,
            });
            // Get bills
            const bills = await mockStoreBills.getBills();
            expect(bills.length).toBe(4);
        });
    });
    describe("When an error occurs on API", () => {
        beforeEach(() => {
            //jest.spyOn(object, methodName, accessType):Spy bills list method
            jest.spyOn(mockStore, "bills");
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
        });
        test("Then,fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"));
                    },
                };
            });
            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"));
                    },
                };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});
