"""Config flow for the Whiteboard integration.

There is nothing to configure: adding the entry simply switches the card from
per-browser storage to a shared board stored in Home Assistant.
"""

from __future__ import annotations

from typing import Any

try:  # Home Assistant 2024.4 and newer
    from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
except ImportError:  # older cores
    from homeassistant.config_entries import ConfigFlow
    from homeassistant.data_entry_flow import FlowResult as ConfigFlowResult

from .const import DOMAIN


class WhiteboardConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single-instance config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Whiteboard", data={})

        return self.async_show_form(step_id="user")
