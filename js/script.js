const BASE_URL = "https://sellsync-backend-production.up.railway.app";


// =========================
// NAVIGATION TOGGLE
// =========================
document.addEventListener("DOMContentLoaded", function () {

    const menuIcon = document.getElementById("menuIcon");
    const navItems = document.getElementById("navitems");

    if(menuIcon && navItems){
        menuIcon.addEventListener("click", function () {
            navItems.classList.toggle("active");
        });
    }

});


// =========================
// ROLE SELECTION + REGISTER
// =========================
document.addEventListener("DOMContentLoaded", function () {

    let selectedRole = "admin";
    const roleButtons = document.querySelectorAll(".role-button");

    function updateRoleFields(role) {

        selectedRole = role;

        document.querySelectorAll(".role-fields").forEach(section => {
            section.style.display = "none";
            section.querySelectorAll("input")
                .forEach(input => input.removeAttribute("required"));
        });

        const selectedFields = document.getElementById(`${selectedRole}-fields`);

        if(selectedFields){
            selectedFields.style.display = "block";
            selectedFields.querySelectorAll("input")
                .forEach(input => input.setAttribute("required","required"));
        }

        roleButtons.forEach(btn => btn.classList.remove("active"));

        const activeBtn = document.querySelector(`[data-role="${role}"]`);
        if(activeBtn){
            activeBtn.classList.add("active");
        }
    }

    if(roleButtons.length > 0){

        roleButtons.forEach(button => {
            button.addEventListener("click", () => {
                updateRoleFields(button.dataset.role);
            });
        });

        updateRoleFields(selectedRole);
    }


    // ===== REGISTER =====
    const registerForm = document.getElementById("signupForm");

    if(registerForm){

        registerForm.addEventListener("submit", async function(e){

            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const phone = document.getElementById("phone").value;

            const selectedRoleBtn =
                document.querySelector(".role-button.active");

            const selectedRole =
                selectedRoleBtn ? selectedRoleBtn.dataset.role : null;

            if(!selectedRole)
                return Swal.fire("Error","Select role","error");

            if(!email.includes("@"))
                return Swal.fire("Error","Invalid email","error");

            if(password.length < 6)
                return Swal.fire("Error","Password min 6 chars","error");

            if(password !== confirmPassword)
                return Swal.fire("Error","Passwords mismatch","error");

            let payload = { email,password,phone };

            if(selectedRole === "admin"){
                const username =
                    document.getElementById("username").value;

                if(!username)
                    return Swal.fire("Error","Username required","error");

                payload.username = username;
            }

            if(selectedRole === "manufacturer" ||
               selectedRole === "wholesaler"){

                payload.organizationName =
                    document.querySelector(`#${selectedRole}-fields input[name="organizationName"]`)?.value || "";

                payload.address =
                    document.querySelector(`#${selectedRole}-fields input[name="address"]`)?.value || "";

                payload.gstNumber =
                    document.querySelector(`#${selectedRole}-fields input[name="gstNumber"]`)?.value || "";
            }

            try{

                const res = await fetch(
                    `${BASE_URL}/api/register/${selectedRole}`,
                    {
                        method:"POST",
                        credentials:"include",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify(payload)
                    }
                );

                const result = await res.text();

                if(res.ok){
                    Swal.fire("Success","Registered","success")
                        .then(()=> window.location.href="Login.html");
                }
                else{
                    Swal.fire("Error","Register failed: "+result,"error");
                }

            }
            catch(err){
                console.error(err);
                Swal.fire("Error","Server error","error");
            }

        });

    }

});


// =========================
// LOGIN MODULE
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if(!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try{

            const response = await fetch(
                `${BASE_URL}/api/auth/login`,
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    credentials:"include",
                    body:JSON.stringify({email,password})
                }
            );

            if(!response.ok)
                throw new Error("Login Failed");

            const data = await response.json();
            const role = data.role;

            Swal.fire({
                icon:"success",
                title:"Login Success"
            }).then(()=>{

                if(role === "ADMIN")
                    window.location.href="admindashboard.html";

                else if(role === "MANUFACTURER")
                    window.location.href="manufacturerdashboard.html";

                else if(role === "WHOLESALER")
                    window.location.href="wholesalerdashboard.html";

                else
                    Swal.fire("Error","Unknown role","error");

            });

        }
        catch(error){
            console.error("LOGIN ERROR:",error);
            Swal.fire("Error","Login failed","error");
        }

    });

});
