import {NavLink} from "react-router-dom";
import {Link} from "@mui/material";
import React from "react";
import './styles.scss';


export const Header = () => {
    const getActiveLink = ({ isActive }: { isActive: boolean }): string => isActive ? 'is-active' : '';

    return (
        <header className="header">
            <NavLink to="/pontem-native" className={getActiveLink}>
                <Link variant='button' href="/" underline='none'>Pontem Native</Link>
            </NavLink>
            <NavLink to="/hippo-adapter" className={getActiveLink}>
                <Link variant='button' href="/" underline='hover'>Hippo Adapter</Link>
            </NavLink>
        </header>
    )
};
